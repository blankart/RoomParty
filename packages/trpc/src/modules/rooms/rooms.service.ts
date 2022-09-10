import ModelsService from "../models/models.service"

class Rooms {
    constructor() { }
    private static instance?: Rooms
    static getInstance() {
        if (!Rooms.instance) {
            Rooms.instance = new Rooms()
        }

        return Rooms.instance
    }

    async findById(id: string) {
        return await ModelsService.client.room.findFirst({
            where: {
                id
            },
            include: {
                chats: true
            }
        })
    }

    async create(name: string) {
        return await ModelsService.client.room.create({
            data: {
                name
            }
        })
    }
}

const RoomsService = Rooms.getInstance()

export default RoomsService