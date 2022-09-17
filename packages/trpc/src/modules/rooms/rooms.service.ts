import ChatsService from "../chats/chats.service";
import ModelsService from "../models/models.service";
import QueueService from "../queue/queue.service";
import { CurrentUser } from "../../types/user";
import { TRPCError } from "@trpc/server";

enum ROOMS_SERVICE_QUEUE {
  DELETE_ROOM = "DELETE_ROOM",
}

class Rooms {
  constructor() { }
  private static instance?: Rooms;
  static getInstance() {
    if (!Rooms.instance) {
      Rooms.instance = new Rooms();
    }

    return Rooms.instance;
  }

  async findById(id: string) {
    return await ModelsService.client.room
      .findFirst({
        where: {
          id,
        },
        include: {
          chats: {
            take: 20,
            orderBy: {
              createdAt: 'desc'
            }
          },
          owner: {
            select: {
              userId: true,
            },
          },
        },
      })
      .then((res) => {
        if (!res) return res;
        return {
          ...res,
          chats: res.chats.reverse().map(
            ChatsService.convertEmoticonsToEmojisInChatsObject
          ),
        };
      });
  }

  async deleteRoom(data: { data: { id: string } }) {
    await ModelsService.client.room.delete({
      where: { id: data.data.id },
    });
  }

  async create(name: string, user: CurrentUser) {
    const room = await ModelsService.client.room.create({
      data: {
        name,
        chats: {
          create: {
            name: "Welcome Message",
            message: user
              ? `Welcome to ${name}'s room!`
              : `Welcome to ${name}'s room! This room is only available for 24 hours. Create an account to own a watch room!`,
            isSystemMessage: true,
          },
        },
        ...(user ? { owner: { connect: { id: user.id } } } : {}),
      },
    });

    if (user?.id) {
      const startAfter = new Date();
      const ONE_DAY_IN_MS = 1_000 * 60 * 60 * 24;
      startAfter.setTime(startAfter.getTime() + ONE_DAY_IN_MS);

      QueueService.queue(
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
    return await ModelsService.client.room
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
        },
      })
      .then((res) =>
        res
          .map((r) => ({
            owner: r.owner?.userId,
            videoPlatform: r.videoPlatform,
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

  async deleteMyRoom(id: string, user: CurrentUser) {
    const willDeleteRoom = await ModelsService.client.room.findFirst({
      where: { id, owner: { id: user?.id } }
    })

    if (!willDeleteRoom) throw new TRPCError({ code: 'UNAUTHORIZED' })

    return await ModelsService.client.room.delete({
      where: { id }
    })
  }
}

const RoomsService = Rooms.getInstance();

export default RoomsService;
