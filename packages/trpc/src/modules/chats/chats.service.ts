import { Subscription } from "@trpc/server";
import { checkText } from "smile2emoji";

import type { Chat } from "@rooms2watch/prisma-client";

import type { CurrentUser } from "../../types/user";
import ModelsService from "../models/models.service";
import EmitterInstance from "../../utils/Emitter";

interface EmitterTypes {
  SEND: Chat;
}

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
    return new Subscription<Chat>((emit) => {
      const onAdd = (data: Chat) => {
        emit.data(data);
      };

      ChatsEmitter.channel("SEND").on(data.id, onAdd);

      Promise.all([
        ModelsService.client.chat
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
          ),

        this.incrementOnlineCount(data.id, data.localStorageSessionId, user),
      ]);

      return () => {
        ChatsEmitter.channel("SEND").off(data.id, onAdd);

        Promise.all([
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

          this.decrementOnlineCount(data.id, data.localStorageSessionId, user),
        ]);
      };
    });
  }
}

const ChatsService = Chats.getInstance();

export default ChatsService;
