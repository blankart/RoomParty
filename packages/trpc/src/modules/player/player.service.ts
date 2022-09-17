import { Subscription } from "@trpc/server";
import { PlayerStatus } from "../../types/player";
import ModelsService from "../models/models.service";
import EmitterInstance from "../../utils/Emitter";
import ChatsService, { ChatsEmitter } from "../chats/chats.service";
import QueueService from "../queue/queue.service";

interface EmitterTypes {
  CONTROL: PlayerStatus;
}

enum PLAYER_SERVICE_QUEUE {
  NOTIFY_CONTROL_TO_CHAT = "NOTIFY_CONTROL_TO_CHAT",
}

export const PlayerEmitter = EmitterInstance.for<EmitterTypes>("PLAYER");
class Player {
  constructor() {}
  private static instance?: Player;
  static getInstance() {
    if (!Player.instance) {
      Player.instance = new Player();
    }

    return Player.instance;
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
        message = `${params.data.statusObject.name} ${
          params.data.statusObject.type === "PAUSED" ? "paused" : "played"
        } the video.`;
        break;
      case "CHANGE_URL":
        message = `${params.data.statusObject.name} changed the video (${params.data.statusObject.url})`;
        break;
      default:
        break;
    }

    if (!message) return;
    await ModelsService.client.chat
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
          ChatsService.convertEmoticonsToEmojisInChatsObject(res)
        )
      );
  }

  async control(data: { id: string; statusObject: PlayerStatus }) {
    PlayerEmitter.channel("CONTROL").emit(data.id, data.statusObject);
    await ModelsService.client.room.update({
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

    QueueService.queue(
      PLAYER_SERVICE_QUEUE.NOTIFY_CONTROL_TO_CHAT,
      this.createChatAfterControl,
      { id: data.id, statusObject: data.statusObject },
      { startAfter },
      data.id
    );
  }
}

const PlayerService = Player.getInstance();

export default PlayerService;
