import zod from "zod";
import ChatsService from "./chats.service";
import { injectable, inject } from "inversify";
import { SERVICES_TYPES, TRPC_ROUTER } from "../../types/container";
import TRPCRouter from "../../trpc/router";

export const CHATS_ROUTER_NAME = "chats";

@injectable()
class ChatsRoutes {
    constructor(
        @inject(SERVICES_TYPES.Chats) private chatsService: ChatsService,
        @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
    ) { }

    router() {
        const self = this;
        return this.trpcRouter.createRouter()
            .query("chats", {
                input: zod.string(),
                async resolve({ input }) {
                    return self.chatsService.findChatsByRoomId(input);
                },
            })

            .mutation("send", {
                input: zod.object({
                    name: zod.string(),
                    message: zod.string(),
                    id: zod.string(),
                    userId: zod.string().optional(),
                    color: zod.string(),
                }),
                async resolve({ input }) {
                    return await self.chatsService.send(input);
                },
            });
    }

    routerWithUser() {
        const self = this;
        return this.trpcRouter.createRouterWithUser().subscription("chatSubscription", {
            input: zod.object({
                id: zod.string(),
                name: zod.string(),
                localStorageSessionId: zod.number(),
            }),
            async resolve({ input, ctx }) {
                return await self.chatsService.chatSubscription(input, ctx.user);
            },
        });
    }
}

export default ChatsRoutes;
