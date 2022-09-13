import { createRouter } from "../../trpc";
import zod, { z } from 'zod'
import PlayerService from "./player.service";
import { PlayerStatus } from "../../types/player";

type As<T extends z.ZodType, A> = T | z.ZodEffects<T, A, A | string>

export const PLAYER_ROUTER_NAME = 'player'

export const playerRouter = createRouter()
    .subscription('statusSubscription', {
        input: zod.object({
            id: zod.string(),
            name: zod.string(),
        }),
        async resolve({ input }) {
            return await PlayerService.statusSubscription(input)
        }
    })

    .mutation('control', {
        input: zod.object({
            id: zod.string(),
            statusObject: zod.object({
                type: zod.string(),
                time: zod.number().optional(),
                name: zod.string(),
                sessionId: zod.number(),
                url: zod.string(),
                thumbnail: zod.string().optional()
            })
        }),
        async resolve({ input }) {
            return await PlayerService.control(input as { id: string, statusObject: PlayerStatus })
        }
    })