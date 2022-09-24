import { VideoPlatform } from "@rooms2watch/prisma-client";

export type PlayerStatus = (
  | {
      type: "PAUSED";
    }
  | { type: "PLAYED" }
  | {
      type: "SEEK_TO";
    }
  | {
      type: "CHANGE_URL";
    }
) & {
  name: string;
  time: number;
  tabSessionId: number;
  thumbnail?: string;
  videoPlatform: VideoPlatform;
  url: string;
};
