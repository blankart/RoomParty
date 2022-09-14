import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import ModelsService from "../models/models.service";

class Users {
  constructor(private googleOAuth2Client: OAuth2Client) { }
  private static instance?: Users;
  static getInstance() {
    if (!Users.instance) {
      const googleOAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.SERVER_URL + "/oauth/google"
      );

      Users.instance = new Users(googleOAuth2Client);
    }

    return Users.instance;
  }

  async getUserByGoogleOAuthAccessToken(accessToken: string) {
    let userInfo, user
    try {
      userInfo = (await google.oauth2("v2").userinfo.get({
        alt: "json",
        oauth_token: accessToken,
      }))?.data;

      user = await ModelsService.client.account.findFirst({
        where: {
          provider: "Google",
          providerId: userInfo.id!,
        },
        include: {
          user: true,
        },
      });

      return { userInfo, user }
    } catch {
      return { userInfo, user };
    }
  }

  async googleOAuth(data: { code: string; scope: string }) {
    const { tokens } = await this.googleOAuth2Client.getToken(data.code);
    const { data: userInfo } = await google.oauth2("v2").userinfo.get({
      alt: "json",
      oauth_token: tokens.access_token!,
    });
    const maybeUser = await ModelsService.client.account.findFirst({
      where: {
        providerId: userInfo.id!,
      },
    });

    const res = {
      token: tokens.access_token,
    };

    if (maybeUser) {
      await ModelsService.client.account.update({
        where: { id: maybeUser.id },
        data: {
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          expires_at: tokens.expiry_date,
          token_type: tokens.token_type,
          scope: tokens.scope,
          id_token: tokens.id_token,
        },
      });

      return res;
    }

    await ModelsService.client.account.create({
      data: {
        provider: "Google",
        providerId: userInfo.id!,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_at: tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope,
        id_token: tokens.id_token,
        user: {
          create: {
            name: userInfo.name,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            picture: userInfo.picture,
          },
        },
      },
    });

    return res;
  }

  async googleOAuthWithToken(input: { access_token: string, scope?: string, token_type?: string, expires_in?: number }) {
    const { user, userInfo } = await this.getUserByGoogleOAuthAccessToken(input.access_token)

    if (user) return true
    if (!userInfo) return false
    await ModelsService.client.account.create({
      data: {
        provider: "Google",
        providerId: userInfo.id!,
        access_token: input.access_token,
        expires_at: new Date(input.expires_in!).getTime(),
        token_type: input.token_type,
        user: {
          create: {
            name: userInfo.name,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            picture: userInfo.picture,
          },
        },
      },
    });

    return true
  }

  async me(id: string) {
    return await ModelsService.client.account.findFirst({
      where: { id },
      select: {
        id: true,
        user: true,
      },
    });
  }
}

const UsersService = Users.getInstance();

export default UsersService;
