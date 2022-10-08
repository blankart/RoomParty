import type { PassportStatic } from "passport";
import type { Express } from "express";
import { Strategy as GoogleOAuth2Strategy } from "passport-google-oauth20";
import { AuthNextCallback, JwtPayload, JwtSigner } from "../../types";
import type { CustomPrismaClient } from "@RoomParty/prisma-client";

export const OAUTH_URL_REDIRECT_ROUTE = "/oauth2/redirect/google";

type GoogleOAuth20StrategyParams = ConstructorParameters<
  typeof GoogleOAuth2Strategy
>;

type GoogleOAuth20ProviderCallbackParamsShifted = Parameters<
  GoogleOAuth20StrategyParams[1]
> extends [
  infer Req,
  infer AccessToken,
  infer RefresToken,
  infer Options,
  infer Profile,
  infer Done
]
  ? [Req, AccessToken, RefresToken, Profile, AuthNextCallback]
  : never;

type InitializeGoogleOAuth20ProviderOptions = Omit<
  GoogleOAuth20StrategyParams[0],
  "callbackURL"
> & { serverUrl: string; webCallbackUrl: string };

export default function initializeGoogleOAuth20Provider(
  expressApp: Express,
  passportInstance: PassportStatic,
  options: InitializeGoogleOAuth20ProviderOptions,
  prismaClient: CustomPrismaClient,
  jwtSigner: JwtSigner
) {
  async function googleOAuth20ProviderCallback(
    ...params: GoogleOAuth20ProviderCallbackParamsShifted
  ) {
    const [req, accessToken, refreshToken, profile, done] = params;
    let maybeUser = await prismaClient.account.findFirst({
      where: { providerId: profile.id, provider: "Google" },
    });

    if (!maybeUser) {
      maybeUser = await prismaClient.account.create({
        data: {
          provider: "Google",
          providerId: profile.id,
          isVerified: true,
          email: profile._json.email!,
          user: {
            create: {
              name: profile.displayName ?? profile.name?.givenName,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              picture: profile.photos?.[0]?.value ?? profile.profileUrl,
            },
          },
        },
      });
    }

    const jwtPayload: JwtPayload = {
      ...maybeUser,
    };

    return done(null, jwtPayload);
  }

  const { serverUrl, ...googleOAuth20Ooptions } = options;
  passportInstance.use(
    new GoogleOAuth2Strategy(
      {
        ...googleOAuth20Ooptions,
        callbackURL: serverUrl + OAUTH_URL_REDIRECT_ROUTE,
      },
      googleOAuth20ProviderCallback as any
    )
  );

  expressApp.get(
    OAUTH_URL_REDIRECT_ROUTE,
    passportInstance.authenticate("google", { scope: ["email", "profile"] }),
    jwtSigner(options.webCallbackUrl)
  );
}
