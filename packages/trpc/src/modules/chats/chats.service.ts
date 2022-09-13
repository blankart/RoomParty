import ModelsService from "../models/models.service"
import { EventEmitter } from 'events'
import { Subscription } from "@trpc/server"
import { Chat } from "prisma-client"
import { checkText } from 'smile2emoji'
import { CurrentUser } from "../../types/user"

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

    convertEmoticonsToEmojisInChatsObject(chat: Chat): Chat {
        return ({ ...chat, message: checkText(chat.message) })
    }

    async findChatsByRoomId(id: string) {
        return await ModelsService.client.room.findFirst({
            where: {
                id
            },
            select: {
                chats: true
            }
        }).then(res => (res?.chats ?? []).map(c => ({ ...c, message: checkText(c.message) })))
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

        chatsEventEmitter.emit(`${data.id}.send`, this.convertEmoticonsToEmojisInChatsObject(newChat))

        return newChat
    }

    private async incrementOnlineCount(id: string, localStorageSessionId: number, user: CurrentUser) {
        const existingRoom = await ModelsService.client.room.findFirst({
            where: { id }, include: {
                onlineUsers: {
                    select: {
                        id: true

                    }
                }
            }
        })
        if (!existingRoom) return

        if (!user && !existingRoom.onlineGuests.includes(localStorageSessionId)) {
            return ModelsService.client.room.update({
                where: { id: existingRoom.id },
                data: {
                    onlineGuests: [...existingRoom.onlineGuests, localStorageSessionId]
                }
            })
        }

        if (user && !existingRoom.onlineUsers.find(({ id }) => id === user.user.id)) {
            return ModelsService.client.room.update({
                where: { id: existingRoom.id },
                data: {
                    onlineUsers: {
                        connect: {
                            id: user.user.id
                        }
                    }
                }
            })
        }
    }

    private async decrementOnlineCount(id: string, localStorageSessionId: number, user: CurrentUser) {
        const existingRoom = await ModelsService.client.room.findFirst({
            where: { id }, include: {
                onlineUsers: {
                    select: {
                        id: true

                    }
                }
            }
        })

        if (!existingRoom) return

        if (!user && existingRoom.onlineGuests.includes(localStorageSessionId)) {
            return ModelsService.client.room.update({
                where: { id: existingRoom.id },
                data: {
                    onlineGuests: existingRoom.onlineGuests.filter(lcid => lcid !== localStorageSessionId)
                }
            })
        }

        if (user && existingRoom.onlineUsers.find(({ id }) => id === user.user.id)) {
            return ModelsService.client.room.update({
                where: { id: existingRoom.id },
                data: {
                    onlineUsers: {
                        disconnect: {
                            id: user.user.id
                        }
                    }
                }
            })
        }
    }

    async chatSubscription(data: { id: string, name: string, localStorageSessionId: number }, user: CurrentUser) {
        return new Subscription<Chat>((emit) => {
            const onAdd = (data: Chat) => {
                emit.data(data)
            }

            chatsEventEmitter.on(`${data.id}.send`, onAdd)

            Promise.all([
                ModelsService.client.chat.create({
                    data: {
                        name: data.name,
                        message: `${data.name} has joined the room.`,
                        isSystemMessage: true,
                        room: {
                            connect: {
                                id: data.id
                            }
                        }
                    }
                }).then(res => chatsEventEmitter.emit(`${data.id}.send`, this.convertEmoticonsToEmojisInChatsObject(res))),

                this.incrementOnlineCount(data.id, data.localStorageSessionId, user)
            ])

            return () => {
                chatsEventEmitter.off(`${data.id}.send`, onAdd)

                Promise.all([
                    ModelsService.client.chat.create({
                        data: {
                            name: data.name,
                            message: `${data.name} has left the room.`,
                            isSystemMessage: true,
                            room: {
                                connect: {
                                    id: data.id
                                }
                            }
                        }
                    }).then(res => chatsEventEmitter.emit(`${data.id}.send`, this.convertEmoticonsToEmojisInChatsObject(res))),

                    this.decrementOnlineCount(data.id, data.localStorageSessionId, user)
                ])
            }
        })
    }
}

const ChatsService = Chats.getInstance()

export default ChatsService