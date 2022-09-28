import {
  createPrismaClient,
  CustomPrismaClient,
} from "@RoomParty/prisma-client";
import { injectable } from "inversify";

@injectable()
class ModelsService {
  client: CustomPrismaClient;

  constructor() {
    this.client = createPrismaClient();
  }
}

export default ModelsService;
