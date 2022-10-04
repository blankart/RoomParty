import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import { TemporaryChat } from "../../types/temporary-chat";
import EmitterService from "../emitter/emitter.service";

interface EmitterTypes {
  SEND: TemporaryChat;
}

@injectable()
class TemporaryChatsEmitter {
  constructor(
    @inject(SERVICES_TYPES.Emitter) private emitterService: EmitterService
  ) {}

  get emitter() {
    return this.emitterService.for<EmitterTypes>("CHATS");
  }
}

export default TemporaryChatsEmitter;
