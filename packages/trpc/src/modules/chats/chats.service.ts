import ModelsService from "../models/models.service"
import { EventEmitter } from 'events'
import { Subscription } from "@trpc/server"
import { Chat } from "prisma-client"

const chatsEventEmitter = new EventEmitter()

class Chats {
    constructor() { }
    private static instance?: Chats
    static getInstance() {
        if (!Chats.instance) {
            Chats.instance = new Chats()
        }

        return Chats.instance
    }

    async findChatsByRoomId(id: string) {
        return await ModelsService.client.room.findFirst({
            where: {
                id
            },
            select: {
                chats: true
            }
        }).then(res => res?.chats ?? [])
    }

    async send(data: { name: string, message: string, id: string }) {
        const newChat = await ModelsService.client.chat.create({
            data: {
                name: data.name,
                message: data.message,
                room: {
                    connect: {
                        id: data.id
                    }
                },
            },
        })

        chatsEventEmitter.emit(`${data.id}.send`, newChat)

        return newChat
    }

    async chatSubscription(id: string) {
        return new Subscription<Chat>(emit => {
            const onAdd = (data: Chat) => {
                emit.data(data)
            }

            chatsEventEmitter.on(`${id}.send`, onAdd)

            return () => {
                chatsEventEmitter.off(`${id}.send`, onAdd)
            }
        })
    }
}

const ChatsService = Chats.getInstance()

export default ChatsService