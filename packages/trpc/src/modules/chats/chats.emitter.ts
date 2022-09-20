import { Chat } from "@rooms2watch/prisma-client";
import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import EmitterService from "../emitter/emitter.service";

interface EmitterTypes {
    SEND: Chat;
}

@injectable()
class ChatsEmitter {
    constructor(
        @inject(SERVICES_TYPES.Emitter) private emitterService: EmitterService
    ) {
    }

    get emitter() {
        return this.emitterService.for<EmitterTypes>('CHATS')
    }
}

export default ChatsEmitter