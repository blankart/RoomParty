import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import type YoutubeService from "./youtube.service";

@injectable()
class YoutubeController {
  constructor(
    @inject(SERVICES_TYPES.Youtube) private youtubeService: YoutubeService
  ) {}

  async search(q: string) {
    if (!q) q = "funny dogs";
    return await this.youtubeService.getVideosByQ(q);
  }
}

export default YoutubeController;
