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
  let jwtMock: DeepMockProxy<ReturnType<typeof createAuthProviderJwt>>;

  beforeEach(() => {
    modelsServiceMock = mockDeep<ModelsService>();
    emailServiceMock = mockDeep<EmailService>();
    usersServiceMock = mockDeep<UsersService>();
    usersController = new UsersController(
      modelsServiceMock,
      emailServiceMock,
      usersServiceMock
    );
    jwtMock = mockDeep<ReturnType<typeof createAuthProviderJwt>>();
  });

  test("me", async () => {
    await usersController.me("SAMPLE ID");
    expect(modelsServiceMock.client.account.findFirst).toBeCalled();
    expect((modelsServiceMock as any).client.account.findFirst.mock.calls)
      .toMatchInlineSnapshot(`
      [
        [
          {
            "select": {
              "id": true,
              "user": true,
            },
            "where": {
              "id": "SAMPLE ID",
            },
          },
        ],
      ]
    `);
  });

  test("signIn", async () => {
    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => null
    );
    let maybeWillThrow = async () =>
      await usersController.signIn(
        { email: "email@email.com", password: "PASSWORD" },
        jwtMock
      );

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({})
    );

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({ password: "PASSWORD" })
    );

    await expect(maybeWillThrow).rejects.toThrow();

    (usersServiceMock as any).comparePasswordHash.mockImplementation(
      () => true
    );

    await maybeWillThrow();

    expect(jwtMock.signer).toBeCalled();
    expect(jwtMock.signer).toBeCalledTimes(1);
    expect((jwtMock as any).signer.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "password": "PASSWORD",
          },
        ],
      ]
    `);
  });

  test("signUp", async () => {
    let maybeWillThrow = async () =>
      await usersController.signUp({
        email: "email@email.com",
        password: "PASSWORD",
        password2: "PASSWORD",
        agreeToTermsAndConditions: true,
      });

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({})
    );

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => null
    );
    (modelsServiceMock as any).client.account.create.mockImplementation(() => ({
      verificationCode: "123456",
      email: "email@email.com",
    }));

    await maybeWillThrow();

    expect(modelsServiceMock.client.account.create).toBeCalled();
    expect(emailServiceMock.sendEmailConfirmation).toBeCalled();

    expect((emailServiceMock as any).sendEmailConfirmation.mock.calls)
      .toMatchInlineSnapshot(`
      [
        [
          {
            "code": "123456",
            "email": "email@email.com",
          },
        ],
      ]
    `);
  });

  test("getVerificationDetails", async () => {
    let maybeWillThrow = async () =>
      await usersController.getVerificationDetails({ accountId: "ACCOUNT_ID" });

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({})
    );

    await maybeWillThrow();
  });

  test("resendVerificationCode", async () => {
    let maybeWillThrow = async () =>
      await usersController.resendVerificationCode({
        email: "email@email.com",
      });

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({})
    );

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({
        isVerified: true,
      })
    );

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({
        isVerified: false,
        nextResendVerificationDate: new Date(Date.now() + 999_000),
      })
    );

    await expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({
        isVerified: false,
        nextResendVerificationDate: new Date(Date.now() - 20_000),
      })
    );

    (modelsServiceMock as any).client.account.update.mockImplementation(() => ({
      email: "email@email.com",
      verificationCode: "123456",
    }));

    await maybeWillThrow();

    expect(modelsServiceMock.client.account.update).toBeCalled();
    expect(emailServiceMock.sendEmailConfirmation).toBeCalled();

    expect((emailServiceMock as any).sendEmailConfirmation.mock.calls)
      .toMatchInlineSnapshot(`
      [
        [
          {
            "code": "123456",
            "email": "email@email.com",
          },
        ],
      ]
    `);
  });

  test("confirmVerificationCode", async () => {
    let maybeWillThrow = async () =>
      await usersController.confirmVerificationCode(
        { code: "123456", email: "email@email.com" },
        jwtMock
      );

    expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({ isVerified: true })
    );

    expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({ isVerified: false, verificationCode: "111111" })
    );

    expect(maybeWillThrow).rejects.toThrow();

    (modelsServiceMock as any).client.account.findFirst.mockImplementation(
      () => ({ isVerified: false, verificationCode: "123456" })
    );
    (modelsServiceMock as any).client.account.update.mockImplementation(() => ({
      isVerified: true,
      verificationCode: null,
      user: {
        name: "Sample User",
      },
    }));

    await maybeWillThrow();

    expect(jwtMock.signer).toBeCalled();
    expect(jwtMock.signer).toBeCalledTimes(1);

    expect((jwtMock as any).signer.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "isVerified": true,
            "user": {
              "name": "Sample User",
            },
            "verificationCode": null,
          },
        ],
      ]
    `);
  });

  afterEach(() => {
    mockClear(modelsServiceMock);
    mockClear(emailServiceMock);
    mockClear(usersServiceMock);
    mockClear(jwtMock);
  });
});
