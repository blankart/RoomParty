import { createRouter } from './trpc'
import superjson from 'superjson'

/**
 * Controllers
 */
import { ROOMS_ROUTER_NAME, roomsRouter } from './modules/rooms/rooms.controller'
import { CHATS_ROUTER_NAME, chatsRouter } from './modules/chats/chats.controller'


function routeNameForMerge<T extends string>(route: T): `${T}.` {
    return route + '.' as `${T}.`
}

export const router =
    createRouter()
        .transformer(superjson)
        .merge(routeNameForMerge(ROOMS_ROUTER_NAME), roomsRouter)
        .merge(routeNameForMerge(CHATS_ROUTER_NAME), chatsRouter)

export type AppRouter = typeof router