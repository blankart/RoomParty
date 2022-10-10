import { Subscription, TRPCError } from "@trpc/server";
import { inject, injectable } from "inversify";

import { EMITTER_TYPES, SERVICES_TYPES } from "../../types/container";
import { TemporaryChat } from "../../types/temporary-chat";
import { CurrentUser } from "../../types/user";
import ChatsService from "../chats/chats.service";
import ModelsService from "../models/models.service";
import { RoomSyncIntervalMap } from "../player/player.service";
import RoomsService from "../rooms/rooms.service";

import { ChatsSubscriptionSchema, SendSchema } from "./temporary-chats.dto";
import TemporaryChatsEmitter from "./temporary-chats.emitter";

@injectable()
class TemporaryChatsController {
  constructor(
    @inject(SERVICES_TYPES.Rooms) private roomsService: RoomsService,
    @inject(SERVICES_TYPES.Chats) private chatsService: ChatsService,
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(EMITTER_TYPES.TemporaryChats)
    private temporaryChatsEmitter: TemporaryChatsEmitter
  ) { }

  async send(data: SendSchema) {
    this.temporaryChatsEmitter.emitter.channel("SEND").emit(data.id, data);
  }

  async chatSubscription(data: ChatsSubscriptionSchema, user: CurrentUser) {
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

    const myRoomTransient =
      await this.modelsService.client.roomTransient.findFirst({
        where: { id: data.roomTransientId },
        select: {
          id: true,
        },
      });

    if (!myRoomTransient) throw new TRPCError({ code: "NOT_FOUND" });

    return new Subscription<TemporaryChat>(async (emit) => {
      const onAdd = (data: TemporaryChat) => {
        emit.data(data);
      };

      this.temporaryChatsEmitter.emitter.channel("SEND").on(data.id, onAdd);
      await this.modelsService.client.roomTransient.update({
        where: { id: myRoomTransient.id },
        data: {
          concurrentSessionCount: {
            increment: 1,
          },
        },
      });

      Promise.all([
        (async () => {
          if (
            ((
              await this.modelsService.client.roomTransient.findFirst({
                where: { id: myRoomTransient.id },
                select: { concurrentSessionCount: true },
              })
            )?.concurrentSessionCount ?? 0) > 1
          )
            return;

          const temporaryChat = {
            name: "System Message",
            message: `${data.name} has joined the room.`,
            isSystemMessage: true,
          };

          this.temporaryChatsEmitter.emitter
            .channel("SEND")
            .emit(
              data.id,
              this.chatsService.convertEmoticonsToEmojisInChatsObject(
                temporaryChat
              )
            );
        })(),
      ]);

      return async () => {
        const updatedRoomTransient =
          await this.modelsService.client.roomTransient.update({
            where: { id: myRoomTransient.id },
            data: {
              concurrentSessionCount: {
                decrement: 1,
              },
            },
            select: { concurrentSessionCount: true },
          });

        this.temporaryChatsEmitter.emitter.channel("SEND").off(data.id, onAdd);

        if ((updatedRoomTransient.concurrentSessionCount ?? 0) === 0)
          await Promise.all([
            this.temporaryChatsEmitter.emitter.channel("SEND").emit(
              data.id,
              this.chatsService.convertEmoticonsToEmojisInChatsObject({
                name: "System Message",
                message: `${data.name} has left the room.`,
                isSystemMessage: true,
              })
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

export default TemporaryChatsController;
