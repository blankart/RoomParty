import zod from "zod";
import { injectable, inject } from "inversify";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import TRPCRouter from "../../trpc/router";
import ChatsController from "./chats.controller";

export const CHATS_ROUTER_NAME = "chats";

@injectable()
class ChatsRouter {
    constructor(
        @inject(CONTROLLER_TYPES.Chats) private chatsController: ChatsController,
        @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
    ) { }

    router() {
        const self = this;
        return this.trpcRouter.createRouter()
            .query("chats", {
                input: zod.string(),
                async resolve({ input }) {
                    return self.chatsController.chats(input);
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
                    return await self.chatsController.send(input);
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
                return await self.chatsController.chatSubscription(input, ctx.user);
            },
        });
    }
}

export default ChatsRouter;
