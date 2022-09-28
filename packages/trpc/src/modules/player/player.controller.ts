import { Subscription } from "@trpc/server";
import type { PlayerStatus } from "../../types/player";
import type ModelsService from "../models/models.service";
import { inject, injectable } from "inversify";
import { EMITTER_TYPES, SERVICES_TYPES } from "../../types/container";
import type PlayerService from "./player.service";
import PlayerEmitter from "./player.emitter";
import { ControlSchema, StatusSubscriptionSchema } from "./player.dto";
import { VideoPlatform } from "@RoomParty/prisma-client";

export const RoomSyncIntervalMap = new Map<string, NodeJS.Timer>();
@injectable()
class PlayerController {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Player) private playerService: PlayerService,
    @inject(EMITTER_TYPES.Player) private playerEmitter: PlayerEmitter
  ) {
    this.playerEmitter.emitter
      .channel("CONTROL")
      .on(
        "*",
        this.playerService.synchronizeScrubTime.bind(this.playerService)
      );
  }

  async statusSubscription(data: StatusSubscriptionSchema) {
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

  async control(data: ControlSchema) {
    let videoPlatform: VideoPlatform = data.statusObject?.videoPlatform;
    if (!videoPlatform && data.statusObject.type === "CHANGE_URL") {
      if (data.statusObject.url?.match(/youtube\.com/))
        videoPlatform = "Youtube" as const;
      if (data.statusObject.url?.match(/twitch\.tv/))
        videoPlatform = "Twitch" as const;
      if (data.statusObject.url?.match(/facebook\.com/))
        videoPlatform = "Facebook" as const;
      if (data.statusObject.url?.match(/vimeo\.com/))
        videoPlatform = "Vimeo" as const;
      if (data.statusObject.url?.match(/mixcloud\.com/))
        videoPlatform = "Mixcloud" as const;
    }

    data.statusObject.videoPlatform = videoPlatform;

    await this.modelsService.client.room.update({
      where: {
        id: data.id,
      },
      data: {
        ...(videoPlatform ? { videoPlatform } : {}),
        ...(data.statusObject?.thumbnail
          ? { thumbnailUrl: data.statusObject?.thumbnail }
          : {}),
        playerStatus: data.statusObject,
      },
    });

    data.statusObject.videoPlatform;

    this.playerEmitter.emitter.channel("CONTROL").emit(data.id, {
      ...data.statusObject,
      id: data.id,
    });

    const startAfter = new Date();
    startAfter.setTime(startAfter.getTime() + 1_000);

    // this.playerService.createChatAfterControl(room, { data });
  }
}

export default PlayerController;
