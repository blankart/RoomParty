import { PlayerStatus } from "../../types/player";
import type ModelsService from "../models/models.service";
import type ChatsService from "../chats/chats.service";
import { inject, injectable } from "inversify";
import { EMITTER_TYPES, SERVICES_TYPES } from "../../types/container";
import ChatsEmitter from "../chats/chats.emitter";
import { convertTimeToFormattedTime } from "@RoomParty/shared-lib";
import { Room } from "@RoomParty/prisma-client";

export const RoomSyncIntervalMap = new Map<string, NodeJS.Timer>();

@injectable()
class PlayerService {
  constructor(
    @inject(SERVICES_TYPES.Chats) private chatsService: ChatsService,
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(EMITTER_TYPES.Chats) private chatsEmitter: ChatsEmitter
  ) {}

  async synchronizeScrubTime({
    id,
    ...playerStatus
  }: PlayerStatus & { id: string }) {
    switch (playerStatus.type) {
      case "CHANGE_URL":
      case "PAUSED":
      case "SEEK_TO":
        clearTimeout(RoomSyncIntervalMap.get(id));
        break;
      case "PLAYED":
        clearTimeout(RoomSyncIntervalMap.get(id));
        RoomSyncIntervalMap.set(
          id,
          setInterval(() => {
            this.modelsService.client.room
              .findFirst({
                where: { id },
                select: { playerStatus: true },
              })
              .then(async (room) => {
                if (!room) return;
                const { playerStatus } = room;
                if (playerStatus && typeof playerStatus !== "object") return;
                await this.modelsService.client.room.update({
                  where: { id },
                  data: {
                    playerStatus: {
                      ...((playerStatus as any) || {}),
                      time: ((room as any).playerStatus?.time ?? 0) + 5,
                    },
                  },
                });
              });
          }, 5_000)
        );
      default:
        break;
    }
  }

  async createChatAfterControl(
    room: Room,
    params: {
      data: { id: string; statusObject: PlayerStatus };
    }
  ) {
    let message;

    switch (params.data.statusObject.type) {
      case "SEEK_TO":
        message = `${
          params.data.statusObject.name
        } jumped the video to ${convertTimeToFormattedTime(
          params.data.statusObject.time
        )}.`;
        break;
      case "PAUSED":
      case "PLAYED":
        message = `${params.data.statusObject.name} ${
          params.data.statusObject.type === "PAUSED" ? "paused" : "played"
        } the video.`;
        break;
      case "CHANGE_URL":
        if (
          (room.playerStatus as PlayerStatus).url !==
          params.data.statusObject.url
        )
          message = `${params.data.statusObject.name} changed the video (${params.data.statusObject.url})`;
        break;
      default:
        break;
    }

    if (!message) return;
    const chat = await this.modelsService.client.chat.create({
      data: {
        room: {
          connect: {
            id: params.data.id,
          },
        },
        name: "Player Status",
        isSystemMessage: true,
        message,
      },
    });

    this.chatsEmitter.emitter
      .channel("SEND")
      .emit(
        params.data.id,
        this.chatsService.convertEmoticonsToEmojisInChatsObject(chat)
      );
  }
}

export default PlayerService;
