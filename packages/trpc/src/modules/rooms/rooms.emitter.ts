import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import type EmitterService from "../emitter/emitter.service";
import type { RoomMetadata } from "./rooms.controller";

type EmitterTypes = {
    UPDATE_SETTINGS: RoomMetadata
}

@injectable()
class RoomsEmitter {
    constructor(
        @inject(SERVICES_TYPES.Emitter) private emitterService: EmitterService
    ) { }

    get emitter() {
        return this.emitterService.for<EmitterTypes>("ROOMS");
    }

}

export default RoomsEmitter