import { Subscription } from "@trpc/server"
import { EventEmitter } from 'events'
import { PlayerStatus } from "../../types/player"
import ModelsService from "../models/models.service"

const playerStatusEventEmitter = new EventEmitter()

class Player {
    constructor() { }
    private static instance?: Player
    static getInstance() {
        if (!Player.instance) {
            Player.instance = new Player()
        }

        return Player.instance
    }

    async statusSubscription(data: { id: string, name: string }) {
        return new Subscription<PlayerStatus>(emit => {
            const onAdd = (data: PlayerStatus) => {
                emit.data(data)
            }

            playerStatusEventEmitter.on(`${data.id}.statusSubscription.control`, onAdd)

            return () => {
                playerStatusEventEmitter.off(`${data.id}.statusSubscription.control`, onAdd)
            }
        })
    }

    async control(data: { id: string, statusObject: any }) {
        playerStatusEventEmitter.emit(`${data.id}.statusSubscription.control`, data.statusObject)
        await ModelsService.client.room.update({
            where: {
                id: data.id
            },
            data: {
                playerStatus: data.statusObject
            }
        })
    }
}

const PlayerService = Player.getInstance()

export default PlayerService