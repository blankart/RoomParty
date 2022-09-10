import { createRouter } from "../../trpc";
import zod from 'zod'
import RoomsService from "./rooms.service";
import { TRPCError } from "@trpc/server";

export const ROOMS_ROUTER_NAME = 'rooms'

export const roomsRouter = createRouter()
    .mutation('create', {
        input: zod.object({
            name: zod.string()
        }),
        async resolve({ input }) {
            try {
                return await RoomsService.create(input.name)
            } catch (e) {
                throw new TRPCError({
                    message: e as any,
                    code: 'BAD_REQUEST'
                })
            }
        }
    })

    .query('findById', {
        input: zod.string(),
        async resolve({ input }) {
            try {
                const room = await RoomsService.findById(input)
                if (!room) {
                    throw new TRPCError({
                        message: 'Room not found',
                        code: 'NOT_FOUND'
                    })
                }

                return room
            } catch (e) {
                throw new TRPCError({
                    message: e as any,
                    code: 'BAD_REQUEST'
                })
            }
        }
    })
