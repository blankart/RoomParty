import { VideoPlatform } from "@RoomParty/prisma-client";
import { ControlSchema } from "../modules/player/player.dto";

export type PlayerStatus = {
  type: ControlSchema["statusObject"]["type"];
  name: string;
  time: number;
  tabSessionId: number;
  thumbnail?: string;
  videoPlatform: VideoPlatform;
  url: string;
};
