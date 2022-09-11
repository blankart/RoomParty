export type PlayerStatus = ({
    type: 'PAUSED'
} | { type: 'PLAYED' } | {
    type: 'SEEK_TO',
} | {
    type: 'CHANGE_URL',
    url: string
}) & { name: string, time: number, sessionId: number, url: string } 