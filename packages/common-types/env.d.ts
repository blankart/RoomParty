export interface CustomProcessEnv {
    NODE_ENV: 'development' | 'production';
    SERVER_PORT?: number
    NEXT_PUBLIC_SERVER_URL?: string
    SERVER_URL?: string
    DATABASE_URL?: string
    NEXT_PUBLIC_WEBSOCKET_URL?: string
    WEBSOCKET_PORT?: number
    WEB_BASE_URL?: string
    NEXT_PUBLIC_WEB_BASE_URL?: string
    PORT?: number
}