import zod from "zod";

export const statusSubscriptionSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
});

export const controlSchema = zod.object({
  roomTransientId: zod.string(),
  id: zod.string(),
  statusObject: zod.object({
    type: zod.enum(["CHANGE_URL", "PAUSED", "PLAYED", "SEEK_TO"]),
    time: zod.number(),
    name: zod.string(),
    tabSessionId: zod.number(),
    url: zod.string(),
    thumbnail: zod.string().optional(),
    videoPlatform: zod.enum([
      "Youtube",
      "Twitch",
      "Facebook",
      "Vimeo",
      "Mixcloud",
    ]),
  }),
});
