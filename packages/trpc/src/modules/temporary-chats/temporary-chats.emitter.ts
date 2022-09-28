import { inject, injectable } from "inversify";
import { TemporaryChats } from "../../types/chats";
import { SERVICES_TYPES } from "../../types/container";
import EmitterService from "../emitter/emitter.service";

interface EmitterTypes {
    SEND: TemporaryChats
}

@injectable()
class TemporaryChatsEmitter {
    constructor(
        @inject(SERVICES_TYPES.Emitter) private emitterService: EmitterService
    ) { }

    get emitter() {
        return this.emitterService.for<EmitterTypes>("CHATS");
    }

}

export default TemporaryChatsEmitter