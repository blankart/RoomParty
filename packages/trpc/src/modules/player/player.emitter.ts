import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import { PlayerStatus } from "../../types/player";
import EmitterService from "../emitter/emitter.service";

interface EmitterTypes {
  CONTROL: PlayerStatus & { id: string };
}

@injectable()
class PlayerEmitter {
  constructor(
    @inject(SERVICES_TYPES.Emitter) private emitterService: EmitterService
  ) {}

  get emitter() {
    return this.emitterService.for<EmitterTypes>("PLAYER");
  }
}

export default PlayerEmitter;
