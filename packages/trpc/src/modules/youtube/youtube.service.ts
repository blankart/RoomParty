import ytrs from "ytsr";
import type { SearchResponse } from "../../types/youtube";
import { injectable } from "inversify";

const SEARCH_LIMIT = 30;

@injectable()
class YoutubeService {
  constructor() {}
  async getVideosByQ(q: string) {
    const searchFilter = await ytrs.getFilters(q);

    const searchType = searchFilter.get("Type")?.get("Video");

    if (!searchType || !searchType.url) return undefined;

    return (await ytrs(searchType.url, {
      limit: SEARCH_LIMIT,
    })) as SearchResponse;
  }
}

export default YoutubeService;
