export interface CustomProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT?: number
    SERVER_PORT?: number
    NEXT_PUBLIC_SERVER_URL?: string
    SERVER_URL?: string
    DATABASE_URL?: string

    NEXT_PUBLIC_WEBSOCKET_URL?: string
    WEBSOCKET_PORT?: number

    WEB_BASE_URL?: string
    NEXT_PUBLIC_WEB_BASE_URL?: string

    NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID?: string
    GOOGLE_OAUTH_CLIENT_ID?: string

    NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_SECRET?: string
    GOOGLE_OAUTH_CLIENT_SECRET?: string

    NEXT_PUBLIC_GOOGLE_WEB_OAUTH_CLIENT_SECRET?: string
    GOOGLE_WEB_OAUTH_CLIENT_SECRET?: string

    NEXT_PUBLIC_GOOGLE_WEB_OAUTH_CLIENT_ID?: string
    GOOGLE_WEB_OAUTH_CLIENT_ID?: string
}