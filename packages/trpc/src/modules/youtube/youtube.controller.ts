import { createRouter } from "../../trpc";
import zod from 'zod'
import YoutubeService from "./youtube.service";

export const YOUTUBE_ROUTER_NAME = 'youtube'

export const youtubeRouter = createRouter()
    .query('search', {
        input: zod.string(),
        async resolve({ input }) {
            return await YoutubeService.search(input)
        }
    })
