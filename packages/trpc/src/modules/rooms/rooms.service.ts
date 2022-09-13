import ChatsService from "../chats/chats.service"
import ModelsService from "../models/models.service"
import QueueService from "../queue/queue.service"
import { CurrentUser } from "../../types/user"

enum ROOMS_SERVICE_QUEUE {
    DELETE_ROOM = 'DELETE_ROOM'
}

class Rooms {
    constructor() { }
    private static instance?: Rooms
    static getInstance() {
        if (!Rooms.instance) {
            Rooms.instance = new Rooms()
        }

        return Rooms.instance
    }

    async findById(id: string) {
        return await ModelsService.client.room.findFirst({
            where: {
                id
            },
            include: {
                chats: true,
                account: {
                    select: {
                        id: true
                    }
                }
            }
        }).then(res => {
            if (!res) return res
            return { ...res, chats: res.chats.map(ChatsService.convertEmoticonsToEmojisInChatsObject) }
        })
    }

    async deleteRoom(data: { data: { id: string } }) {
        await ModelsService.client.room.delete({
            where: { id: data.data.id },
        })
    }

    async create(name: string, user: CurrentUser) {
        const room = await ModelsService.client.room.create({
            data: {
                name,
                chats: {
                    create: {
                        name: 'Welcome Message',
                        message: user ? `Welcome to ${name}'s room!` : `Welcome to ${name}'s room! This room is only available for 24 hours. Create an account to own a watch room!`,
                        isSystemMessage: true
                    }
                },
                ...(user ? { account: { connect: { id: user.id } } } : {})
            },
            include: {
                account: {
                    select: {
                        id: true
                    }
                }
            }
        })

        if (!room.account?.id) {
            const startAfter = new Date()
            startAfter.setTime(startAfter.getTime() + 1_000 * 60 * 60 * 24)

            QueueService.queue(
                ROOMS_SERVICE_QUEUE.DELETE_ROOM,
                this.deleteRoom,
                { id: room.id },
                { startAfter },
                room.id
            )
        }

        return room
    }

    async findMyRoom(id: string) {
        return await ModelsService.client.room.findMany({
            where: {
                account: {
                    id
                }
            },
            select: {
                id: true,
                name: true,
                playerStatus: true,
                online: true,
                createdAt: true
            }
        }).then(res => res.map(r => ({
            id: r.id,
            name: r.name,
            online: r.online,
            thumbnail: (r.playerStatus as any)?.thumbnail as string | null | undefined,
            createdAt: r.createdAt
        })).sort((a, b) => a.createdAt.getTime() < b.createdAt.getTime() ? 1 : -1))
    }
}

const RoomsService = Rooms.getInstance()

export default RoomsService