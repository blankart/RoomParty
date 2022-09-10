import { createRouter } from "../../trpc";
import zod from 'zod'
import ChatsService from "./chats.service";

export const CHATS_ROUTER_NAME = 'chats'

export const chatsRouter = createRouter()
    .query('chats', {
        input: zod.string(),
        async resolve({ input }) {
            return ChatsService.findChatsByRoomId(input)
        }
    })

    .mutation('send', {
        input: zod.object({
            name: zod.string(),
            message: zod.string(),
            id: zod.string()
        }),
        async resolve({ input }) {
            return await ChatsService.send(input)
        }
    })

    .subscription('chatSubscription', {
        input: zod.string(),
        async resolve({ input }) {
            return await ChatsService.chatSubscription(input)
        }
    })
