import { Subscription } from "@trpc/server";
import { checkText } from "smile2emoji";

import type { Chat } from "@rooms2watch/prisma-client";

import type { CurrentUser } from "../../types/user";
import ModelsService from "../models/models.service";
import EmitterInstance from "../../utils/Emitter";
import RoomsService from "../rooms/rooms.service";
import { RoomSyncIntervalMap } from "../player/player.service";

interface EmitterTypes {
  SEND: Chat;
}

const TempRoomSessionMap = new Map<string, number>();

export const ChatsEmitter = EmitterInstance.for<EmitterTypes>("CHATS");

class Chats {
  constructor() {}
  private static instance?: Chats;
  static getInstance() {
    if (!Chats.instance) {
      Chats.instance = new Chats();
    }

    return Chats.instance;
  }

  convertEmoticonsToEmojisInChatsObject(chat: Chat): Chat {
    return { ...chat, message: checkText(chat.message) };
  }

  async findChatsByRoomId(id: string) {
    return await ModelsService.client.room
      .findFirst({
        where: {
          id,
        },
        select: {
          chats: {
            take: 20,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })
      .then((res) =>
        (res?.chats ?? [])
          .reverse()
          .map(this.convertEmoticonsToEmojisInChatsObject)
      );
  }

  async send(data: {
    name: string;
    message: string;
    id: string;
    userId?: string;
    color: string;
  }) {
    const newChat = await ModelsService.client.chat.create({
      data: {
        name: data.name,
        message: data.message,
        room: {
          connect: {
            id: data.id,
          },
        },
        ...(data.userId
          ? {
              color: data.color,
              user: {
                connect: {
                  id: data.userId,
                },
              },
            }
          : {}),
      },
    });

    ChatsEmitter.channel("SEND").emit(
      data.id,
      this.convertEmoticonsToEmojisInChatsObject(newChat)
    );

    return newChat;
  }

  private async incrementOnlineCount(
    id: string,
    localStorageSessionId: number,
    user: CurrentUser
  ) {
    const existingRoom = await ModelsService.client.room.findFirst({
      where: { id },
      include: {
        onlineUsers: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!existingRoom) return;

    if (!user && !existingRoom.onlineGuests.includes(localStorageSessionId)) {
      return ModelsService.client.room.update({
        where: { id: existingRoom.id },
        data: {
          onlineGuests: [...existingRoom.onlineGuests, localStorageSessionId],
        },
      });
    }

    if (
      user &&
      !existingRoom.onlineUsers.find(({ id }) => id === user.user.id)
    ) {
      return ModelsService.client.room.update({
        where: { id: existingRoom.id },
        data: {
          onlineUsers: {
            connect: {
              id: user.user.id,
            },
          },
        },
      });
    }
  }

  private async decrementOnlineCount(
    id: string,
    localStorageSessionId: number,
    user: CurrentUser
  ) {
    const existingRoom = await ModelsService.client.room.findFirst({
      where: { id },
      include: {
        onlineUsers: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingRoom) return;

    if (!user && existingRoom.onlineGuests.includes(localStorageSessionId)) {
      return ModelsService.client.room.update({
        where: { id: existingRoom.id },
        data: {
          onlineGuests: existingRoom.onlineGuests.filter(
            (lcid) => lcid !== localStorageSessionId
          ),
        },
      });
    }

    if (
      user &&
      existingRoom.onlineUsers.find(({ id }) => id === user.user.id)
    ) {
      return ModelsService.client.room.update({
        where: { id: existingRoom.id },
        data: {
          onlineUsers: {
            disconnect: {
              id: user.user.id,
            },
          },
        },
      });
    }
  }

  async chatSubscription(
    data: { id: string; name: string; localStorageSessionId: number },
    user: CurrentUser
  ) {
    return new Subscription<Chat & { color: string | null }>((emit) => {
      const onAdd = (data: Chat & { color: string | null }) => {
        emit.data(data);
      };

      ChatsEmitter.channel("SEND").on(data.id, onAdd);
      TempRoomSessionMap.set(
        JSON.stringify(data),
        (TempRoomSessionMap.get(JSON.stringify(data)) ?? 0) + 1
      );

      Promise.all([
        (async () => {
          if ((TempRoomSessionMap.get(JSON.stringify(data)) ?? 0) > 1) return;
          await ModelsService.client.chat
            .create({
              data: {
                name: data.name,
                message: `${data.name} has joined the room.`,
                isSystemMessage: true,
                room: {
                  connect: {
                    id: data.id,
                  },
                },
              },
            })
            .then((res) =>
              ChatsEmitter.channel("SEND").emit(
                data.id,
                this.convertEmoticonsToEmojisInChatsObject(res)
              )
            );
        })(),
        this.incrementOnlineCount(data.id, data.localStorageSessionId, user),
      ]);

      return async () => {
        TempRoomSessionMap.set(
          JSON.stringify(data),
          Math.max(0, (TempRoomSessionMap.get(JSON.stringify(data)) ?? 0) - 1)
        );

        ChatsEmitter.channel("SEND").off(data.id, onAdd);

        if ((TempRoomSessionMap.get(JSON.stringify(data)) ?? 0) === 0)
          await Promise.all([
            ModelsService.client.chat
              .create({
                data: {
                  name: data.name,
                  message: `${data.name} has left the room.`,
                  isSystemMessage: true,
                  room: {
                    connect: {
                      id: data.id,
                    },
                  },
                },
              })
              .then((res) =>
                ChatsEmitter.channel("SEND").emit(
                  data.id,
                  this.convertEmoticonsToEmojisInChatsObject(res)
                )
              ),

            this.decrementOnlineCount(
              data.id,
              data.localStorageSessionId,
              user
            ),
          ]);

        if ((await RoomsService.countNumberOfOnlineInRoom(data.id)) <= 0) {
          clearInterval(RoomSyncIntervalMap.get(data.id));
        }
      };
    });
  }
}

const ChatsService = Chats.getInstance();

export default ChatsService;
