import type ModelsService from "../models/models.service";
import { injectable, inject } from "inversify";
import { SERVICES_TYPES } from "../../types/container";

const IDENTIFICATION_ID_MAX_LENGTH = 8;
const allowedCharacters = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";

@injectable()
class RoomsService {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
  ) {}

  roomIdentificationIdGenerator() {
    let generatedId = "";

    for (let i = 0; i < IDENTIFICATION_ID_MAX_LENGTH; i++) {
      generatedId +=
        allowedCharacters[Math.floor(Math.random() * allowedCharacters.length)];
    }

    return generatedId;
  }

  async deleteRoom(data: { data: { id: string } }) {
    await this.modelsService.client.room.delete({
      where: { id: data.data.id },
    });
  }

  async countNumberOfOnlineInRoom(id: string) {
    return await this.modelsService.client.roomTransient.count({
      where: {
        room: {
          id,
        },
      },
    });
  }
}

export default RoomsService;
