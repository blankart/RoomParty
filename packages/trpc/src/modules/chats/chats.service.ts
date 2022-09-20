import { checkText } from "smile2emoji";

import type { Chat } from "@rooms2watch/prisma-client";

import { injectable } from "inversify";

@injectable()
class ChatsService {
  constructor() {}
  convertEmoticonsToEmojisInChatsObject(chat: Chat): Chat {
    return { ...chat, message: checkText(chat.message) };
  }
}

export default ChatsService;
