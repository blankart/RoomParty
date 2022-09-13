import { createRouter } from './trpc'
import superjson from 'superjson'

/**
 * Controllers
 */
import { ROOMS_ROUTER_NAME, roomsRouter } from './modules/rooms/rooms.controller'
import { CHATS_ROUTER_NAME, chatsRouter } from './modules/chats/chats.controller'
import { PLAYER_ROUTER_NAME, playerRouter } from './modules/player/player.controller'
import { YOUTUBE_ROUTER_NAME, youtubeRouter } from './modules/youtube/youtube.controller'
import { USERS_ROUTER_NAME, usersRouter, usersProtectedRouter } from './modules/users/users.controller'


function routeNameForMerge<T extends string>(route: T): `${T}.` {
    return route + '.' as `${T}.`
}
export const router =
    createRouter()
        .transformer(superjson)

        .merge(routeNameForMerge(ROOMS_ROUTER_NAME), roomsRouter)

        .merge(routeNameForMerge(CHATS_ROUTER_NAME), chatsRouter)

        .merge(routeNameForMerge(PLAYER_ROUTER_NAME), playerRouter)

        .merge(routeNameForMerge(YOUTUBE_ROUTER_NAME), youtubeRouter)

        .merge(routeNameForMerge(USERS_ROUTER_NAME), usersRouter)
        .merge(routeNameForMerge(USERS_ROUTER_NAME), usersProtectedRouter)

export type AppRouter = typeof router