import { Subscription, TRPCError } from "@trpc/server";
import type { Chat } from "@partyfy/prisma-client";
import type { CurrentUser } from "../../types/user";
import type ModelsService from "../models/models.service";
import type _RoomsService from "../rooms/rooms.service";
import { RoomSyncIntervalMap } from "../player/player.service";
import { injectable, inject } from "inversify";
import { EMITTER_TYPES, SERVICES_TYPES } from "../../types/container";
import type RoomsService from "../rooms/rooms.service";
import type ChatsService from "./chats.service";
import type ChatsEmitter from "./chats.emitter";
import { ChatsSchema, ChatSubscriptionSchema, SendSchema } from "./chats.dto";

const TempRoomSessionMap = new Map<string, number>();

@injectable()
class ChatsController {
  constructor(
    @inject(SERVICES_TYPES.Rooms) private roomsService: RoomsService,
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Chats) private chatsService: ChatsService,
    @inject(EMITTER_TYPES.Chats) private chatsEmitter: ChatsEmitter
  ) { }
  async chats(data: ChatsSchema) {
    return await this.modelsService.client.room
      .findFirst({
        where: {
          id: data.id,
        },
        select: {
          chats: {
            take: 20,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })
      .then((res) =>
        (res?.chats ?? [])
          .reverse()
          .map(this.chatsService.convertEmoticonsToEmojisInChatsObject)
      );
  }

  async send(data: SendSchema) {
    const newChat = await this.modelsService.client.chat.create({
      data: {
        name: data.name,
        message: data.message,
        room: {
          connect: {
            id: data.id,
          },
        },
        ...(data.userId
          ? {
            color: data.color,
            user: {
              connect: {
                id: data.userId,
              },
            },
          }
          : {}),
      },
    });

    this.chatsEmitter.emitter
      .channel("SEND")
      .emit(
        data.id,
        this.chatsService.convertEmoticonsToEmojisInChatsObject(newChat)
      );

    return newChat;
  }

  async chatSubscription(data: ChatSubscriptionSchema, user: CurrentUser) {
    const tempRoomSessionMapKey = data.roomTransientId;

    const maybeRoom = await this.modelsService.client.room.findFirst({
      where: { id: data.id },
      select: { roomIdentificationId: true },
    });

    if (!maybeRoom) throw new TRPCError({ code: "NOT_FOUND" });

    const isAuthorizedToEnter = await this.roomsService.isAuthorizedToEnterRoom(
      maybeRoom.roomIdentificationId,
      user,
      data.password
    );

    if (!isAuthorizedToEnter)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to enter this room.",
      });

    return new Subscription<Chat & { color: string | null }>((emit) => {
      const onAdd = (data: Chat & { color: string | null }) => {
        emit.data(data);
      };

      this.chatsEmitter.emitter.channel("SEND").on(data.id, onAdd);
      TempRoomSessionMap.set(
        tempRoomSessionMapKey,
        (TempRoomSessionMap.get(tempRoomSessionMapKey) ?? 0) + 1
      );

      Promise.all([
        (async () => {
          if ((TempRoomSessionMap.get(tempRoomSessionMapKey) ?? 0) > 1) return;
          await this.modelsService.client.chat
            .create({
              data: {
                name: data.name,
                message: `${data.name} has joined the room.`,
                isSystemMessage: true,
                room: {
                  connect: {
                    id: data.id,
                  },
                },
              },
            })
            .then((res) =>
              this.chatsEmitter.emitter
                .channel("SEND")
                .emit(
                  data.id,
                  this.chatsService.convertEmoticonsToEmojisInChatsObject(res)
                )
            );
        })(),
      ]);

      return async () => {
        TempRoomSessionMap.set(
          tempRoomSessionMapKey,
          Math.max(0, (TempRoomSessionMap.get(tempRoomSessionMapKey) ?? 0) - 1)
        );

        this.chatsEmitter.emitter.channel("SEND").off(data.id, onAdd);

        if ((TempRoomSessionMap.get(tempRoomSessionMapKey) ?? 0) === 0)
          await Promise.all([
            this.modelsService.client.chat
              .create({
                data: {
                  name: data.name,
                  message: `${data.name} has left the room.`,
                  isSystemMessage: true,
                  room: {
                    connect: {
                      id: data.id,
                    },
                  },
                },
              })
              .then((res) =>
                this.chatsEmitter.emitter
                  .channel("SEND")
                  .emit(
                    data.id,
                    this.chatsService.convertEmoticonsToEmojisInChatsObject(res)
                  )
              ),

            this.modelsService.client.roomTransient
              .findFirst({
                where: { id: data.roomTransientId },
              })
              .then(async (roomTransient) => {
                if (!roomTransient) return;
                await this.modelsService.client.roomTransient.delete({
                  where: { id: data.roomTransientId },
                });
              }),
          ]);

        if ((await this.roomsService.countNumberOfOnlineInRoom(data.id)) <= 0) {
          clearInterval(RoomSyncIntervalMap.get(data.id));
        }
      };
    });
  }
}

export default ChatsController;
