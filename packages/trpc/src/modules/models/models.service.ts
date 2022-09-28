import {
  createPrismaClient,
  CustomPrismaClient,
} from "@partyfy/prisma-client";
import { injectable } from "inversify";

@injectable()
class ModelsService {
  client: CustomPrismaClient;

  constructor() {
    this.client = createPrismaClient();
  }
}

export default ModelsService;
