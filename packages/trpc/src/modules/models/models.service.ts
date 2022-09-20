import {
  createPrismaClient,
  CustomPrismaClient,
} from "@rooms2watch/prisma-client";
import { injectable } from "inversify";

@injectable()
class ModelsService {
  client: CustomPrismaClient;

  constructor() {
    this.client = createPrismaClient();
  }
}

export default ModelsService;
