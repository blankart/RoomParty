import { Subscription } from "@trpc/server";
import { PlayerStatus } from "../../types/player";
import ModelsService from "../models/models.service";
import EmitterInstance from "../../utils/Emitter";
import ChatsService, { ChatsEmitter } from "../chats/chats.service";
import QueueService from "../queue/queue.service";
import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";

interface EmitterTypes {
  CONTROL: PlayerStatus & { id: string };
}

enum PLAYER_SERVICE_QUEUE {
  NOTIFY_CONTROL_TO_CHAT = "NOTIFY_CONTROL_TO_CHAT",
}

export const PlayerEmitter = EmitterInstance.for<EmitterTypes>("PLAYER");
export const RoomSyncIntervalMap = new Map<string, NodeJS.Timer>();
@injectable()
class PlayerService {
  constructor(
    @inject(SERVICES_TYPES.Chats) private chatsService: ChatsService,
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Queue) private queueService: QueueService,
  ) {
    PlayerEmitter.channel("CONTROL").on("*", this.synchronizeScrubTime);
  }

  private async synchronizeScrubTime({
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

  async statusSubscription(data: { id: string; name: string }) {
    return new Subscription<PlayerStatus>((emit) => {
      const onAdd = (data: PlayerStatus) => {
        emit.data(data);
      };

      PlayerEmitter.channel("CONTROL").on(data.id, onAdd);

      return () => {
        PlayerEmitter.channel("CONTROL").off(data.id, onAdd);
      };
    });
  }

  private async createChatAfterControl(params: {
    data: { id: string; statusObject: PlayerStatus };
  }) {
    let message;

    switch (params.data.statusObject.type) {
      case "PAUSED":
      case "PLAYED":
        message = `${params.data.statusObject.name} ${params.data.statusObject.type === "PAUSED" ? "paused" : "played"
          } the video.`;
        break;
      case "CHANGE_URL":
        message = `${params.data.statusObject.name} changed the video (${params.data.statusObject.url})`;
        break;
      default:
        break;
    }

    if (!message) return;
    await this.modelsService.client.chat
      .create({
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
      })
      .then((res) =>
        ChatsEmitter.channel("SEND").emit(
          params.data.id,
          this.chatsService.convertEmoticonsToEmojisInChatsObject(res)
        )
      );
  }

  async control(data: { id: string; statusObject: PlayerStatus }) {
    PlayerEmitter.channel("CONTROL").emit(data.id, {
      ...data.statusObject,
      id: data.id,
    });
    await this.modelsService.client.room.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.statusObject?.thumbnail
          ? { thumbnailUrl: data.statusObject?.thumbnail }
          : {}),
        playerStatus: data.statusObject,
      },
    });

    const startAfter = new Date();
    startAfter.setTime(startAfter.getTime() + 1_000);

    this.queueService.queue(
      PLAYER_SERVICE_QUEUE.NOTIFY_CONTROL_TO_CHAT,
      this.createChatAfterControl,
      { id: data.id, statusObject: data.statusObject },
      { startAfter },
      data.id
    );
  }
}

export default PlayerService;
