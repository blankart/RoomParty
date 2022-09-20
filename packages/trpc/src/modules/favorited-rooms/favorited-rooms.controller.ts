import ModelsService from "../models/models.service";
import { CurrentUser } from "../../types/user";
import { TRPCError } from "@trpc/server";
import { injectable, inject } from "inversify";
import { SERVICES_TYPES } from "../../types/container";

@injectable()
class FavoritedRoomsController {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
  ) { }
  async toggle(data: { roomId: string }, user: CurrentUser) {
    const room = await this.modelsService.client.room.findFirst({
      where: { id: data.roomId },
    });

    if (!room)
      throw new TRPCError({ code: "BAD_REQUEST", message: "No room found" });

    if (room.accountId === user?.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You are not allowed to toggle favorite your own room.",
      });
    }

    let favoritedRoom;
    try {
      favoritedRoom = await this.modelsService.client.favoritedRoom.findFirst({
        where: {
          roomId: data.roomId,
          userId: user?.user.id,
        },
      });
    } catch { }

    if (!favoritedRoom) {
      return await this.modelsService.client.favoritedRoom.create({
        data: {
          room: {
            connect: {
              id: data.roomId,
            },
          },
          user: {
            connect: {
              id: user?.user.id,
            },
          },
        },
      });
    }

    return await this.modelsService.client.favoritedRoom.delete({
      where: { id: favoritedRoom.id },
    });
  }

  async isRoomFavorited(data: { roomId: string }, user: CurrentUser) {
    const favoritedRoom = await this.modelsService.client.favoritedRoom.findFirst({
      where: {
        roomId: data.roomId,
        userId: user?.user.id,
      },
    });

    if (!!favoritedRoom) return true;
    return false;
  }

  async findMyFavorites(user: CurrentUser) {
    return (
      await this.modelsService.client.favoritedRoom.findMany({
        where: {
          userId: user?.user.id,
        },
        include: {
          room: {
            select: {
              id: true,
              name: true,
              thumbnailUrl: true,
              onlineGuests: true,
              onlineUsers: true,
              playerStatus: true,
              videoPlatform: true,
              roomIdentificationId: true,
            },
          },
        },
      })
    ).map((favoritedRoom) => ({
      id: favoritedRoom.room.id,
      name: favoritedRoom.room.name,
      roomIdentificationId: favoritedRoom.room.roomIdentificationId,
      videoPlatform: favoritedRoom.room.videoPlatform,
      thumbnailUrl:
        favoritedRoom.room.thumbnailUrl ??
        (favoritedRoom as any).room.playerStatus?.thumbnailUrl,
      online:
        favoritedRoom.room.onlineGuests.length +
        favoritedRoom.room.onlineUsers.length,
    }));
  }
}

export default FavoritedRoomsController;
