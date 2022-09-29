import { injectable } from "inversify";
import { Webhook } from 'discord-webhook-node'


@injectable()
class DiscordService {
    roomNotificationsWebhook: Webhook
    constructor() {
        this.roomNotificationsWebhook = new Webhook(process.env.DISCORD_WEBHOOK_ROOM_NOTIFICATION_URL!)
        this.roomNotificationsWebhook.setUsername('Room Notifications')
    }

    async sendRoomNotificationMessage(message: string) {
        if (process.env.NODE_ENV !== 'production') return
        this.roomNotificationsWebhook.send(message)
    }
}

export default DiscordService