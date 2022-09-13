import type { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import ModelsService from '../models/models.service';

class Users {
    constructor(private googleOAuth2Client: OAuth2Client) { }
    private static instance?: Users
    static getInstance() {
        if (!Users.instance) {
            const googleOAuth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_OAUTH_CLIENT_ID,
                process.env.GOOGLE_OAUTH_CLIENT_SECRET,
                process.env.SERVER_URL + '/oauth/google'
            )

            Users.instance = new Users(
                googleOAuth2Client
            )
        }

        return Users.instance
    }

    async getGoogleOAuth(accessToken: string) {
        const { data: userInfo } = await google.oauth2('v2').userinfo.get({
            alt: 'json',
            oauth_token: accessToken
        })

        return userInfo
    }

    async googleOAuth(data: { state: string, code: string, scope: string }) {
        const { tokens } = await this.googleOAuth2Client.getToken(data.code)
        const userInfo = await this.getGoogleOAuth(tokens.access_token!)
        const maybeUser = await ModelsService.client.account.findFirst({
            where: {
                providerId: userInfo.id!
            },
        })

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
                }
            })

            return `${data.state}?${new URLSearchParams({ token: tokens.access_token! }).toString()}`
        }

        await ModelsService.client.account.create({
            data: {
                provider: 'Google',
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
                        picture: userInfo.picture
                    }
                }
            }
        })

        return `${data.state}?${new URLSearchParams({ token: tokens.access_token! }).toString()}`
    }
}

const UsersService = Users.getInstance()

export default UsersService