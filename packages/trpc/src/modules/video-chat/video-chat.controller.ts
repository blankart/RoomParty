import { Subscription, TRPCError } from "@trpc/server";
import { inject, injectable } from "inversify";

import { EMITTER_TYPES, SERVICES_TYPES } from "../../types/container";
import { CurrentUser } from "../../types/user";
import { VideoChatParticipant } from "../../types/video-chat";
import ModelsService from "../models/models.service";
import RoomsService from "../rooms/rooms.service";
import {
  BroadcastStateChangeSchema,
  VideoChatSubscriptionSchema,
} from "./video-chat.dto";
import VideoChatEmitter from "./video-chat.emitter";

const VideoChatParticipantsMap = new Map<string, VideoChatParticipant[]>();

@injectable()
class VideoChatController {
  constructor(
    @inject(EMITTER_TYPES.VideoChat) private videoChatEmitter: VideoChatEmitter,
    @inject(SERVICES_TYPES.Rooms) private roomsService: RoomsService,
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
  ) {}

  async videoChatSubscription(
    data: VideoChatSubscriptionSchema,
    user: CurrentUser
  ) {
    const isAuthorizedToEnter = this.roomsService.isAuthorizedToEnterRoom(
      data.roomIdentificationId,
      user,
      data.password
    );

    if (!isAuthorizedToEnter) throw new TRPCError({ code: "UNAUTHORIZED" });

    const roomTransient =
      await this.modelsService.client.roomTransient.findFirst({
        where: {
          room: {
            roomIdentificationId: data.roomIdentificationId,
          },
          localStorageSessionid: data.localStorageSessionId,
        },
        include: {
          user: {
            select: {
              picture: true,
            },
          },
        },
      });

    if (!roomTransient) throw new TRPCError({ code: "NOT_FOUND" });
    const videoChatParticipants =
      VideoChatParticipantsMap.get(data.roomIdentificationId) ?? [];
    if (
      videoChatParticipants.some(
        (vcp) => vcp.roomTransientId === roomTransient.id
      )
    )
      throw new TRPCError({ code: "BAD_REQUEST" });

    VideoChatParticipantsMap.set(data.roomIdentificationId, [
      ...videoChatParticipants,
      {
        name: roomTransient.name,
        isMuted: data.isMuted,
        isVideoDisabled: data.isVideoDisabled,
        roomTransientId: roomTransient.id,
        picture: roomTransient.user?.picture ?? undefined,
      },
    ]);

    return new Subscription<VideoChatParticipant[]>((emit) => {
      const onAdd = (data: VideoChatParticipant[]) => {
        emit.data(data);
      };

      this.videoChatEmitter.emitter
        .channel("VIDEO_CHAT_PARTICIPANTS")
        .on(data.roomIdentificationId, onAdd);

      this.videoChatEmitter.emitter
        .channel("VIDEO_CHAT_PARTICIPANTS")
        .emit(
          data.roomIdentificationId,
          VideoChatParticipantsMap.get(data.roomIdentificationId) ?? []
        );

      return () => {
        this.videoChatEmitter.emitter
          .channel("VIDEO_CHAT_PARTICIPANTS")
          .off(data.roomIdentificationId, onAdd);

        const newVideoChatParticipantsMapValue = (
          VideoChatParticipantsMap.get(data.roomIdentificationId) ?? []
        ).filter((vcp) => vcp.roomTransientId !== roomTransient.id);
        VideoChatParticipantsMap.set(
          data.roomIdentificationId,
          newVideoChatParticipantsMapValue
        );

        this.videoChatEmitter.emitter
          .channel("VIDEO_CHAT_PARTICIPANTS")
          .emit(data.roomIdentificationId, newVideoChatParticipantsMapValue);
      };
    });
  }

  async broadcastStateChange(
    data: BroadcastStateChangeSchema,
    user: CurrentUser
  ) {
    const isAuthorizedToEnter = this.roomsService.isAuthorizedToEnterRoom(
      data.roomIdentificationId,
      user,
      data.password
    );

    if (!isAuthorizedToEnter) throw new TRPCError({ code: "UNAUTHORIZED" });

    const roomTransient =
      await this.modelsService.client.roomTransient.findFirst({
        where: {
          room: {
            roomIdentificationId: data.roomIdentificationId,
          },
          localStorageSessionid: data.localStorageSessionId,
        },
        select: {
          id: true,
        },
      });

    if (!roomTransient) throw new TRPCError({ code: "NOT_FOUND" });

    const newVideoChatParticipantsMapValue = (
      VideoChatParticipantsMap.get(data.roomIdentificationId) ?? []
    ).map((videoChatParticipant) => {
      if (videoChatParticipant.roomTransientId === roomTransient.id) {
        return {
          ...videoChatParticipant,
          isMuted: data.isMuted,
          isVideoDisabled: data.isVideoDisabled,
        };
      }

      return videoChatParticipant;
    });

    VideoChatParticipantsMap.set(
      data.roomIdentificationId,
      newVideoChatParticipantsMapValue
    );

    this.videoChatEmitter.emitter
      .channel("VIDEO_CHAT_PARTICIPANTS")
      .emit(data.roomIdentificationId, newVideoChatParticipantsMapValue);
  }
}

export default VideoChatController;
