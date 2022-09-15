import type { PassportStatic } from 'passport'
import type { Express } from 'express'
import { Strategy as GoogleOAuth2Strategy } from 'passport-google-oauth20'
import { AuthNextCallback, JwtSigner } from '../../types'

export const OAUTH_URL_REDIRECT_ROUTE = '/oauth2/redirect/google'

type GoogleOAuth20StrategyParams = ConstructorParameters<typeof GoogleOAuth2Strategy>

type GoogleOAuth20ProviderCallbackParamsShifted =
    Parameters<GoogleOAuth20StrategyParams[1]> extends [infer Req, infer AccessToken, infer RefresToken, infer Options, infer Profile, infer Done] ? [Req, AccessToken, RefresToken, Profile, AuthNextCallback] : never

type InitializeGoogleOAuth20ProviderOptions = Omit<GoogleOAuth20StrategyParams[0], 'callbackURL'> & { serverUrl: string; webCallbackUrl: string }

export default function initializeGoogleOAuth20Provider(
    expressApp: Express,
    passportInstance: PassportStatic,
    options: InitializeGoogleOAuth20ProviderOptions,
    jwtSigner: JwtSigner
) {
    async function googleOAuth20ProviderCallback(...params: GoogleOAuth20ProviderCallbackParamsShifted) {
        const [req, accessToken, refreshToken, profile, done] = params
        return done(null, { providerId: profile.id, provider: 'Google' })
    }

    const { serverUrl, ...googleOAuth20Ooptions } = options
    passportInstance.use(
        new GoogleOAuth2Strategy({
            ...googleOAuth20Ooptions,
            callbackURL: serverUrl + OAUTH_URL_REDIRECT_ROUTE,
        },
            googleOAuth20ProviderCallback as any
        )
    )

    expressApp.get(
        OAUTH_URL_REDIRECT_ROUTE,
        passportInstance.authenticate('google', { scope: ['email', 'profile'] }),
        jwtSigner(options.webCallbackUrl)
    )
}



