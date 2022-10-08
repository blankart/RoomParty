import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import ModelsService from "../../models/models.service";
import UsersController from "../users.controller";
import { expect } from "@jest/globals";
import EmailService from "../../email/email.service";
import UsersService from "../users.service";

describe("users.controller", () => {
  let modelsServiceMock: DeepMockProxy<ModelsService>;
  let emailServiceMock: DeepMockProxy<EmailService>;
  let usersServiceMock: DeepMockProxy<UsersService>;
  let usersController: UsersController;

  beforeEach(() => {
    modelsServiceMock = mockDeep<ModelsService>();
    emailServiceMock = mockDeep<EmailService>();
    usersServiceMock = mockDeep<UsersService>();
    usersController = new UsersController(
      modelsServiceMock,
      emailServiceMock,
      usersServiceMock
    );
  });

  test("me", async () => {
    await usersController.me("SAMPLE ID");
    expect(modelsServiceMock.client.account.findFirst).toBeCalled();
    expect(modelsServiceMock.client.account.findFirst).toBeCalledWith({
      where: { id: "SAMPLE ID" },
      select: {
        id: true,
        user: true,
      },
    });
  });
});
