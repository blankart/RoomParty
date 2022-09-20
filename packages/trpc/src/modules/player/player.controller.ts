import { Subscription } from "@trpc/server";
import type { PlayerStatus } from "../../types/player";
import type ModelsService from "../models/models.service";
import type QueueService from "../queue/queue.service";
import { inject, injectable } from "inversify";
import { EMITTER_TYPES, SERVICES_TYPES } from "../../types/container";
import type PlayerService from "./player.service";
import PlayerEmitter from "./player.emitter";

interface EmitterTypes {
  CONTROL: PlayerStatus & { id: string };
}

enum PLAYER_SERVICE_QUEUE {
  NOTIFY_CONTROL_TO_CHAT = "NOTIFY_CONTROL_TO_CHAT",
}

export const RoomSyncIntervalMap = new Map<string, NodeJS.Timer>();
@injectable()
class PlayerController {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Queue) private queueService: QueueService,
    @inject(SERVICES_TYPES.Player) private playerService: PlayerService,
    @inject(EMITTER_TYPES.Player) private playerEmitter: PlayerEmitter
  ) {
    this.playerEmitter.emitter
      .channel("CONTROL")
      .on("*", this.playerService.synchronizeScrubTime);
  }

  async statusSubscription(data: { id: string; name: string }) {
    return new Subscription<PlayerStatus>((emit) => {
      const onAdd = (data: PlayerStatus) => {
        emit.data(data);
      };

      this.playerEmitter.emitter.channel("CONTROL").on(data.id, onAdd);

      return () => {
        this.playerEmitter.emitter.channel("CONTROL").off(data.id, onAdd);
      };
    });
  }

  async control(data: { id: string; statusObject: PlayerStatus }) {
    this.playerEmitter.emitter.channel("CONTROL").emit(data.id, {
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
      this.playerService.createChatAfterControl,
      { id: data.id, statusObject: data.statusObject },
      { startAfter },
      data.id
    );
  }
}

export default PlayerController;
