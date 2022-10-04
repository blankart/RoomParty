import { Subscription, TRPCError } from "@trpc/server";
import type { Chat } from "@RoomParty/prisma-client";
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

    const myRoomTransient = await this.modelsService.client.roomTransient.findFirst({
      where: { id: data.roomTransientId },
      select: {
        id: true
      }
    })

    if (!myRoomTransient) throw new TRPCError({ code: 'NOT_FOUND' })

    return new Subscription<Chat & { color: string | null }>(async (emit) => {
      const onAdd = (data: Chat & { color: string | null }) => {
        emit.data(data);
      };

      this.chatsEmitter.emitter.channel("SEND").on(data.id, onAdd);
      await this.modelsService.client.roomTransient.update({
        where: { id: myRoomTransient.id },
        data: {
          concurrentSessionCount: {
            increment: 1
          }
        }
      })

      Promise.all([
        (async () => {
          if (((await this.modelsService.client.roomTransient.findFirst({ where: { id: myRoomTransient.id }, select: { concurrentSessionCount: true } }))?.concurrentSessionCount ?? 0) > 1) return;
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
        const updatedRoomTransient = await this.modelsService.client.roomTransient.update({
          where: { id: myRoomTransient.id },
          data: {
            concurrentSessionCount: {
              decrement: 1
            }
          },
          select: { concurrentSessionCount: true }
        })

        this.chatsEmitter.emitter.channel("SEND").off(data.id, onAdd);

        if ((updatedRoomTransient.concurrentSessionCount ?? 0) === 0)
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
