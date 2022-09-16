import ModelsService from "../models/models.service";
import { CurrentUser } from "../../types/user";
import { TRPCError } from "@trpc/server";

class FavoritedRooms {
    constructor() { }
    private static instance?: FavoritedRooms;
    static getInstance() {
        if (!FavoritedRooms.instance) {
            FavoritedRooms.instance = new FavoritedRooms();
        }
        return FavoritedRooms.instance;
    }

    async toggle(data: { roomId: string }, user: CurrentUser) {
        const room = await ModelsService.client.room.findFirst({ where: { id: data.roomId } })

        if (!room) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No room found' })

        if (room.accountId === user?.id) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'You are not allowed to toggle favorite your own room.' })
        }

        let favoritedRoom
        try {
            favoritedRoom = await ModelsService.client.favoritedRoom.findFirst({
                where: {
                    roomId: data.roomId,
                    userId: user?.user.id
                }
            })
        } catch { }

        if (!favoritedRoom) {
            return await ModelsService.client.favoritedRoom.create({
                data: {
                    room: {
                        connect: {
                            id: data.roomId
                        }
                    },
                    user: {
                        connect: {
                            id: user?.user.id
                        }
                    }
                }
            })
        }

        return await ModelsService.client.favoritedRoom.delete({
            where: { id: favoritedRoom.id }
        })
    }

    async isRoomFavorited(data: { roomId: string }, user: CurrentUser) {
        const favoritedRoom = await ModelsService.client.favoritedRoom.findFirst({
            where: {
                roomId: data.roomId,
                userId: user?.user.id
            }
        })

        if (!!favoritedRoom) return true
        return false
    }

    async findMyFavorites(user: CurrentUser) {
        console.log(
            await ModelsService.client.favoritedRoom.findMany({
                where: {
                    userId: user?.user.id
                },
                include: {
                    room: {
                        select: {
                            id: true,
                            name: true,
                            thumbnailUrl: true,
                            onlineGuests: true,
                            onlineUsers: true,
                            playerStatus: true
                        }
                    }
                }
            })
        )
        return (await ModelsService.client.favoritedRoom.findMany({
            where: {
                userId: user?.user.id
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        thumbnailUrl: true,
                        onlineGuests: true,
                        onlineUsers: true,
                        playerStatus: true
                    }
                }
            }
        })).map(favoritedRoom => ({
            id: favoritedRoom.room.id,
            name: favoritedRoom.room.name,
            thumbnailUrl: favoritedRoom.room.thumbnailUrl ?? (favoritedRoom as any).room.playerStatus?.thumbnailUrl,
            online: favoritedRoom.room.onlineGuests.length + favoritedRoom.room.onlineUsers.length,
        }))
    }

}

const FavoritedRoomsService = FavoritedRooms.getInstance();

export default FavoritedRoomsService;
