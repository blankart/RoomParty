import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import { VideoChatParticipant } from "../../types/video-chat";
import EmitterService from "../emitter/emitter.service";

interface EmitterTypes {
  VIDEO_CHAT_PARTICIPANTS: VideoChatParticipant[];
}

@injectable()
class VideoChatEmitter {
  constructor(
    @inject(SERVICES_TYPES.Emitter) private emitterService: EmitterService
  ) {}

  get emitter() {
    return this.emitterService.for<EmitterTypes>("VIDEO_CHAT");
  }
}

export default VideoChatEmitter;
