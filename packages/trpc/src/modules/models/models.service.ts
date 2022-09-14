import { createPrismaClient, CustomPrismaClient } from "@rooms2watch/prisma-client";

class Models {
  private static instance?: Models;
  client: CustomPrismaClient;

  constructor() {
    this.client = createPrismaClient();
  }

  static getInstance() {
    if (!Models.instance) {
      Models.instance = new Models();
    }

    return Models.instance;
  }
}

const ModelsService = Models.getInstance();

export default ModelsService;
