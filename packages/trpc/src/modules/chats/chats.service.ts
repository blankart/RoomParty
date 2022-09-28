import { checkText } from "smile2emoji";
import { injectable } from "inversify";

@injectable()
class ChatsService {
  constructor() { }
  convertEmoticonsToEmojisInChatsObject<T extends { message: string }>(chat: T): T {
    return { ...chat, message: checkText(chat.message) };
  }
}

export default ChatsService;
