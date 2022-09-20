import ChatsService from "../chats/chats.service";
import ModelsService from "../models/models.service";
import QueueService from "../queue/queue.service";
import { CurrentUser } from "../../types/user";
import { injectable, inject } from "inversify";
import { TRPCError } from "@trpc/server";
import {
  CreateSchema,
  DeleteMyRoomSchema,
  FindByRoomIdentificationIdSchema,
  GetOnlineInfoSchema,
} from "./rooms.dto";
import { SERVICES_TYPES } from "../../types/container";

enum ROOMS_SERVICE_QUEUE {
  DELETE_ROOM = "DELETE_ROOM",
}

const IDENTIFICATION_ID_MAX_LENGTH = 8;
const allowedCharacters = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";

@injectable()
class RoomsService {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Chats) private chatsService: ChatsService,
    @inject(SERVICES_TYPES.Queue) private queueService: QueueService,
  ) { }
  private roomIdentificationIdGenerator() {
    let generatedId = "";

    for (let i = 0; i < IDENTIFICATION_ID_MAX_LENGTH; i++) {
      generatedId +=
        allowedCharacters[Math.floor(Math.random() * allowedCharacters.length)];
    }

    return generatedId;
  }

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

  async deleteRoom(data: { data: { id: string } }) {
    await this.modelsService.client.room.delete({
      where: { id: data.data.id },
    });
  }

  async create(data: CreateSchema, user: CurrentUser) {
    let roomIdentificationId = this.roomIdentificationIdGenerator();

    while (
      (await this.modelsService.client.room.count({
        where: { roomIdentificationId },
      })) > 0
    ) {
      roomIdentificationId = this.roomIdentificationIdGenerator();
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
        this.deleteRoom,
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

  async getOnlineInfoByRoomIdentificationid(data: GetOnlineInfoSchema) {
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

  async countNumberOfOnlineInRoom(id: string) {
    const onlineUsers = await this.modelsService.client.user.count({
      where: {
        Room: {
          id,
        },
      },
    });

    const onlineGuests = await this.modelsService.client.room
      .findFirst({
        where: { id },
        select: { onlineGuests: true },
      })
      .then((room) => {
        if (!room) return 0;
        return room.onlineGuests?.length;
      });

    return onlineGuests + onlineUsers;
  }
}

export default RoomsService;
