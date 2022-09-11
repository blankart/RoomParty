import ChatsService from "../chats/chats.service"
import ModelsService from "../models/models.service"

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
                chats: true
            }
        }).then(res => {
            if (!res) return res
            return { ...res, chats: res.chats.map(ChatsService.convertEmoticonsToEmojisInChatsObject) }
        })
    }

    async create(name: string) {
        return await ModelsService.client.room.create({
            data: {
                name,
                chats: {
                    create: {
                        name: 'Welcome Message',
                        message: `Welcome to ${name}'s room!`,
                        isSystemMessage: true
                    }
                }
            }
        })
    }
}

const RoomsService = Rooms.getInstance()

export default RoomsService