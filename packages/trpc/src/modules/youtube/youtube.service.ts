import ytrs from 'ytsr'
import { SearchResponse } from '../../types/youtube'

const SEARCH_LIMIT = 10

class Youtube {
    constructor() { }
    private static instance?: Youtube
    static getInstance() {
        if (!Youtube.instance) {
            Youtube.instance = new Youtube()
        }

        return Youtube.instance
    }

    async search(q: string) {
        const searchFilter = await ytrs.getFilters(q)

        const searchType = searchFilter.get('Type')?.get('Video')

        if (!searchType || !searchType.url) return undefined

        return await ytrs(
            searchType.url,
            {
                limit: SEARCH_LIMIT
            }
        ) as SearchResponse
    }
}

const YoutubeService = Youtube.getInstance()

export default YoutubeService