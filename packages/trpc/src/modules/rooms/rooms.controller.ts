import type ChatsService from "../chats/chats.service";
import type ModelsService from "../models/models.service";
import type QueueService from "../queue/queue.service";
import type { CurrentUser } from "../../types/user";
import { injectable, inject } from "inversify";
import { Subscription, TRPCError } from "@trpc/server";
import type {
  CreateSchema,
  DeleteMyRoomSchema,
  FindByRoomIdentificationIdSchema,
  GetOnlineInfoSchema,
  GetRoomInitialMetadataSchema,
  GetSettingsSchema,
  RequestForTransientSchema,
  SaveSettingsSchema,
  SubscribeToRoomMetadataSchema,
  ValidatePasswordSchema,
} from "./rooms.dto";
import { EMITTER_TYPES, SERVICES_TYPES } from "../../types/container";
import type RoomsService from "./rooms.service";
import RoomsEmitter from "./rooms.emitter";
import { Prisma, VideoControlRights } from "@rooms2watch/prisma-client";

enum ROOMS_SERVICE_QUEUE {
  DELETE_ROOM = "DELETE_ROOM",
}

export type RoomMetadata =
  | { type: "CHANGED_ROOM_PRIVACY"; value: boolean }
  | { type: "CHANGED_PASSWORD" }
  | { type: "CHANGED_CONTROL_RIGHTS"; value: VideoControlRights };

@injectable()
class RoomsController {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Chats) private chatsService: ChatsService,
    @inject(SERVICES_TYPES.Queue) private queueService: QueueService,
    @inject(SERVICES_TYPES.Rooms) private roomsService: RoomsService,
    @inject(EMITTER_TYPES.Rooms) private roomsEmitter: RoomsEmitter
  ) {}
  async findByRoomIdentificationId(
    data: FindByRoomIdentificationIdSchema,
    user: CurrentUser
  ) {
    const isAuthorizedToEnter = this.roomsService.isAuthorizedToEnterRoom(
      data.roomIdentificationId,
      user,
      data.password
    );

    if (!isAuthorizedToEnter) throw new TRPCError({ code: "UNAUTHORIZED" });

    const room = await this.modelsService.client.room
      .findFirst({
        where: {
          roomIdentificationId: data.roomIdentificationId,
        },
        select: {
          id: true,
          name: true,
          playerStatus: true,
          videoPlatform: true,
          roomIdentificationId: true,
          private: true,
          videoControlRights: true,
          chats: {
            take: 20,
            orderBy: {
              createdAt: "desc",
            },
          },
          owner: {
            select: {
              userId: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .then((res) => {
        if (!res) return res;
        return {
          ...res,
          chats: res.chats
            .reverse()
            .map(this.chatsService.convertEmoticonsToEmojisInChatsObject),
        };
      });

    if (!room)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No room found matching this ID.",
      });

    return room;
  }

  async create(data: CreateSchema, user: CurrentUser) {
    let roomIdentificationId =
      this.roomsService.roomIdentificationIdGenerator();

    while (
      (await this.modelsService.client.room.count({
        where: { roomIdentificationId },
      })) > 0
    ) {
      roomIdentificationId = this.roomsService.roomIdentificationIdGenerator();
    }

    const room = await this.modelsService.client.room.create({
      data: {
        roomIdentificationId,
        name: data.name,
        chats: {
          create: {
            name: "Welcome Message",
            message: user
              ? `Welcome to ${data.name}'s room!`
              : `Welcome to ${data.name}'s room! This room is only available for 24 hours. Create an account to own a watch room!`,
            isSystemMessage: true,
          },
        },
        ...(user ? { owner: { connect: { id: user.id } } } : {}),
      },
    });

    if (!user?.id) {
      const startAfter = new Date();
      const ONE_DAY_IN_MS = 1_000 * 60 * 60 * 24;
      startAfter.setTime(startAfter.getTime() + ONE_DAY_IN_MS);

      this.queueService.queue(
        ROOMS_SERVICE_QUEUE.DELETE_ROOM,
        this.roomsService.deleteRoom.bind(this.roomsService),
        { id: room.id },
        { startAfter },
        room.id
      );
    }

    return room;
  }

  async findMyRoom(id: string) {
    return await this.modelsService.client.room
      .findMany({
        where: {
          owner: {
            id,
          },
        },
        select: {
          id: true,
          name: true,
          videoPlatform: true,
          owner: {
            select: {
              userId: true,
            },
          },
          createdAt: true,
          roomIdentificationId: true,
          playerStatus: true,
          RoomTransient: {
            select: { id: true },
          },
          private: true,
        },
      })
      .then((res) =>
        res
          .map((r) => ({
            owner: r.owner?.userId,
            private: r.private,
            videoPlatform: r.videoPlatform,
            roomIdentificationId: r.roomIdentificationId,
            id: r.id,
            name: r.name,
            online: r.RoomTransient.length,
            thumbnail: (r.playerStatus as any)?.thumbnail as
              | string
              | null
              | undefined,
            createdAt: r.createdAt,
          }))
          .sort((a, b) =>
            a.createdAt.getTime() < b.createdAt.getTime() ? 1 : -1
          )
      );
  }

  async deleteMyRoom(data: DeleteMyRoomSchema, user: CurrentUser) {
    const willDeleteRoom = await this.modelsService.client.room.findFirst({
      where: { id: data.id, owner: { id: user?.id } },
    });

    if (!willDeleteRoom) throw new TRPCError({ code: "UNAUTHORIZED" });

    return await this.modelsService.client.room.delete({
      where: { id: data.id },
    });
  }

  async getOnlineInfo(data: GetOnlineInfoSchema, user: CurrentUser) {
    const isAuthorizedToEnter = this.roomsService.isAuthorizedToEnterRoom(
      data.roomIdentificationId,
      user,
      data.password
    );

    if (!isAuthorizedToEnter) throw new TRPCError({ code: "UNAUTHORIZED" });
    const roomTransientCount =
      await this.modelsService.client.roomTransient.count({
        where: {
          room: {
            roomIdentificationId: data.roomIdentificationId,
          },
        },
      });

    return await this.modelsService.client.room
      .findFirst({
        where: { roomIdentificationId: data.roomIdentificationId },
        select: {
          RoomTransient: {
            include: {
              user: {
                select: { name: true, picture: true },
              },
            },
          },
        },
      })
      .then((room) => {
        if (!room) return room;

        return {
          count: roomTransientCount,
          usersForDisplay: room.RoomTransient.map((rt) => {
            if (!rt.user) {
              return {
                name: rt.name,
                picture: null,
                localStorageSessionId: rt.localStorageSessionid,
              };
            }

            return {
              name: rt.user.name,
              picture: rt.user.picture,
              localStorageSessionId: rt.localStorageSessionid,
            };
          }),
        };
      });
  }

  async requestForRoomTransient(
    data: RequestForTransientSchema,
    user: CurrentUser
  ) {
    const room = await this.modelsService.client.room.findFirst({
      where: { roomIdentificationId: data.roomIdentificationId },
      include: {
        owner: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!room)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Room does not exist.",
      });

    const isAuthorizedToEnter = await this.roomsService.isAuthorizedToEnterRoom(
      data.roomIdentificationId,
      user,
      data.password
    );

    const maybeExistingTransient =
      await this.modelsService.client.roomTransient.findFirst({
        where: {
          OR: [
            {
              localStorageSessionid: data.localStorageSessionId,
              room: {
                roomIdentificationId: data.roomIdentificationId,
              },
            },
            ...(user
              ? [
                  {
                    user: {
                      id: user.user.id,
                    },
                    room: {
                      roomIdentificationId: data.roomIdentificationId,
                    },
                  },
                ]
              : []),
          ],
        },
        include: {
          user: { select: { id: true } },
        },
      });

    if (!isAuthorizedToEnter) {
      if (maybeExistingTransient)
        await this.modelsService.client.roomTransient.delete({
          where: { id: maybeExistingTransient.id },
        });
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to enter this room.",
      });
    }

    if (maybeExistingTransient) {
      const maybeExistingTransientUser = maybeExistingTransient.user;

      const updateObject = user
        ? {
            name: data.userName,
            user: {
              connect: {
                id: user.user.id,
              },
            },
          }
        : !!maybeExistingTransientUser
        ? {
            name: data.userName,
            user: {
              disconnect: true,
            },
          }
        : {
            name: data.userName,
          };

      if (Object.keys(updateObject).length)
        await this.modelsService.client.roomTransient.update({
          where: { id: maybeExistingTransient.id },
          data: updateObject,
        });

      return maybeExistingTransient;
    }

    return await this.modelsService.client.roomTransient.create({
      data: {
        name: data.userName ?? "User",
        ...(user
          ? {
              user: {
                connect: {
                  id: user?.user.id,
                },
              },
            }
          : {}),
        localStorageSessionid: data.localStorageSessionId,
        room: {
          connect: {
            id: room.id,
          },
        },
      },
    });
  }

  async saveSettings(data: SaveSettingsSchema, user: CurrentUser) {
    const maybeExistingRoom = await this.modelsService.client.room.findFirst({
      where: {
        id: data.id,
        owner: {
          user: {
            id: user?.user.id,
          },
        },
      },
    });

    if (!maybeExistingRoom)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to edit this room.",
      });

    const videoControlRights = data.allowAccessToEveryone
      ? "Everyone"
      : "OwnerOnly";

    await this.modelsService.client.room.update({
      where: { id: data.id },
      data: {
        private: data.private,
        password: data.password,
        videoControlRights,
      },
    });

    if (maybeExistingRoom.videoControlRights !== videoControlRights) {
      this.roomsEmitter.emitter
        .channel("UPDATE_SETTINGS")
        .emit(maybeExistingRoom.roomIdentificationId, {
          type: "CHANGED_CONTROL_RIGHTS",
          value: videoControlRights,
        });
    }

    if (maybeExistingRoom.private !== data.private) {
      this.roomsEmitter.emitter
        .channel("UPDATE_SETTINGS")
        .emit(maybeExistingRoom.roomIdentificationId, {
          type: "CHANGED_ROOM_PRIVACY",
          value: data.private,
        });
    }

    if (maybeExistingRoom.password !== data.password) {
      this.roomsEmitter.emitter
        .channel("UPDATE_SETTINGS")
        .emit(maybeExistingRoom.roomIdentificationId, {
          type: "CHANGED_PASSWORD",
        });
    }

    return "Successfully updated room settings.";
  }

  async getSettings(data: GetSettingsSchema, user: CurrentUser) {
    const maybeExistingRoom = await this.modelsService.client.room.findFirst({
      where: {
        id: data.id,
        owner: {
          id: user?.id,
        },
      },
      select: {
        id: true,
        password: true,
        private: true,
        videoControlRights: true,
      },
    });

    if (!maybeExistingRoom)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to access this room's settings",
      });

    return {
      ...maybeExistingRoom,
      allowAccessToEveryone:
        maybeExistingRoom.videoControlRights === "Everyone",
    };
  }

  async getRoomInitialMetadata(
    data: GetRoomInitialMetadataSchema,
    user: CurrentUser
  ) {
    const isAuthorizedToEnter = await this.roomsService.isAuthorizedToEnterRoom(
      data.roomIdentificationId,
      user
    );

    const room = await this.modelsService.client.room.findFirst({
      where: { roomIdentificationId: data.roomIdentificationId },
      select: {
        id: true,
        roomIdentificationId: true,
        private: true,
        name: true,
      },
    });

    if (!room)
      throw new TRPCError({ code: "NOT_FOUND", message: "Room not found." });

    return { ...room, isAuthorizedToEnter };
  }

  async validatePassword(data: ValidatePasswordSchema) {
    const isAuthorizedToEnter = await this.roomsService.isAuthorizedToEnterRoom(
      data.roomIdentificationId,
      null,
      data.password
    );

    if (!isAuthorizedToEnter)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to enter this room",
      });

    return true as const;
  }

  async subscribeToRoomMetadata(
    data: SubscribeToRoomMetadataSchema,
    user: CurrentUser
  ) {
    const isAuthorizedToEnter = await this.roomsService.isAuthorizedToEnterRoom(
      data.roomIdentificationId,
      user,
      data.password
    );

    if (!isAuthorizedToEnter) throw new TRPCError({ code: "UNAUTHORIZED" });

    return new Subscription<RoomMetadata>((emit) => {
      const onAdd = (data: RoomMetadata) => {
        emit.data(data);
      };

      this.roomsEmitter.emitter
        .channel("UPDATE_SETTINGS")
        .on(data.roomIdentificationId, onAdd);

      return () => {
        this.roomsEmitter.emitter
          .channel("UPDATE_SETTINGS")
          .off(data.roomIdentificationId, onAdd);
      };
    });
  }
}

export default RoomsController;
