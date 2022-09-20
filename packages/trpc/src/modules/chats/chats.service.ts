import { checkText } from "smile2emoji";

import type { Chat } from "@rooms2watch/prisma-client";

import type { CurrentUser } from "../../types/user";
import type ModelsService from "../models/models.service";
import { injectable, inject } from "inversify";
import { SERVICES_TYPES } from "../../types/container";

@injectable()
class ChatsService {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
  ) {}
  convertEmoticonsToEmojisInChatsObject(chat: Chat): Chat {
    return { ...chat, message: checkText(chat.message) };
  }

  async incrementOnlineCount(
    id: string,
    localStorageSessionId: number,
    user: CurrentUser
  ) {
    const existingRoom = await this.modelsService.client.room.findFirst({
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
      return this.modelsService.client.room.update({
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
      return this.modelsService.client.room.update({
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

  async decrementOnlineCount(
    id: string,
    localStorageSessionId: number,
    user: CurrentUser
  ) {
    const existingRoom = await this.modelsService.client.room.findFirst({
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
      return this.modelsService.client.room.update({
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
      return this.modelsService.client.room.update({
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
}

export default ChatsService;
