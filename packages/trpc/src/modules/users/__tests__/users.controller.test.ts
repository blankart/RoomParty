import { DeepMockProxy, mockClear, mockDeep } from "jest-mock-extended";
import ModelsService from "../../models/models.service";
import UsersController from "../users.controller";
import { expect } from "@jest/globals";
import EmailService from "../../email/email.service";
import UsersService from "../users.service";
import { createAuthProviderJwt } from "@RoomParty/auth-providers";

describe("users.controller", () => {
  let modelsServiceMock: DeepMockProxy<ModelsService>;
  let emailServiceMock: DeepMockProxy<EmailService>;
  let usersServiceMock: DeepMockProxy<UsersService>;
  let usersController: UsersController;
  let jwtMock: DeepMockProxy<ReturnType<typeof createAuthProviderJwt>>

  beforeEach(() => {
    modelsServiceMock = mockDeep<ModelsService>();
    emailServiceMock = mockDeep<EmailService>();
    usersServiceMock = mockDeep<UsersService>();
    usersController = new UsersController(
      modelsServiceMock,
      emailServiceMock,
      usersServiceMock
    );
    jwtMock = mockDeep<ReturnType<typeof createAuthProviderJwt>>()
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

  test('signIn', async () => {
    (modelsServiceMock as any).client.account.findFirst.mockImplementation(() => null)
    let maybeWillThrow = async () => await usersController.signIn({ email: 'email@email.com', password: 'PASSWORD' }, jwtMock)

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(() => ({}))

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(() => ({ password: 'PASSWORD' }))

    await expect(maybeWillThrow).rejects.toThrow();

    (usersServiceMock as any).comparePasswordHash.mockImplementation(() => true)

    await maybeWillThrow()

    expect(jwtMock.signer).toBeCalled()
    expect(jwtMock.signer).toBeCalledTimes(1)
  })

  afterEach(() => {
    mockClear(modelsServiceMock)
    mockClear(emailServiceMock)
    mockClear(usersServiceMock)
    mockClear(jwtMock)
  })
});
