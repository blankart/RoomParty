import type ChatsService from "../chats/chats.service";
import type ModelsService from "../models/models.service";
import type QueueService from "../queue/queue.service";
import type { CurrentUser } from "../../types/user";
import { injectable, inject } from "inversify";
import { TRPCError } from "@trpc/server";
import type {
  CreateSchema,
  DeleteMyRoomSchema,
  FindByRoomIdentificationIdSchema,
  GetOnlineInfoSchema,
} from "./rooms.dto";
import { SERVICES_TYPES } from "../../types/container";
import type RoomsService from "./rooms.service";

enum ROOMS_SERVICE_QUEUE {
  DELETE_ROOM = "DELETE_ROOM",
}

@injectable()
class RoomsController {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Chats) private chatsService: ChatsService,
    @inject(SERVICES_TYPES.Queue) private queueService: QueueService,
    @inject(SERVICES_TYPES.Rooms) private roomsService: RoomsService
  ) {}
  async findByRoomIdentificationId(data: FindByRoomIdentificationIdSchema) {
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
          playerStatus: true,
          onlineGuests: true,
          videoPlatform: true,
          onlineUsers: {
            select: { id: true },
          },
          owner: {
            select: {
              userId: true,
            },
          },
          createdAt: true,
          roomIdentificationId: true,
        },
      })
      .then((res) =>
        res
          .map((r) => ({
            owner: r.owner?.userId,
            videoPlatform: r.videoPlatform,
            roomIdentificationId: r.roomIdentificationId,
            id: r.id,
            name: r.name,
            online: r.onlineGuests.length + r.onlineUsers.length,
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

  async getOnlineInfo(data: GetOnlineInfoSchema) {
    const onlineUsersCount = await this.modelsService.client.user.count({
      where: {
        Room: {
          roomIdentificationId: data.roomIdentificationId,
        },
      },
    });

    return await this.modelsService.client.room
      .findFirst({
        where: { roomIdentificationId: data.roomIdentificationId },
        select: {
          onlineGuests: true,
          onlineUsers: {
            take: 3,
            select: {
              name: true,
              picture: true,
            },
          },
        },
      })
      .then((room) => {
        if (!room) return room;

        const onlineInfo = [] as {
          name: string | null;
          picture: string | null;
        }[];

        for (let i = 0; i < Math.min(room.onlineGuests.length, 3); i++) {
          onlineInfo.push({ name: "User", picture: null });
        }

        for (let i = 0; i < room.onlineUsers.length; i++) {
          onlineInfo.push(room.onlineUsers[i]);
        }

        return {
          onlineUsers: room.onlineGuests.length + onlineUsersCount,
          data: onlineInfo.reverse(),
        };
      });
  }
}

export default RoomsController;
