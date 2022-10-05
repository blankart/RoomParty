import { describe, expect, test, jest } from '@jest/globals';
import type RoomsService from '../../rooms/rooms.service';
import type ModelsService from '../../models/models.service'
import type ChatsService from '../chats.service';
import ChatsEmitter from '../chats.emitter';
import { mockDeep, mockClear, DeepMockProxy } from 'jest-mock-extended'

import ChatsController from '../chats.controller';
import { Subscription } from '@trpc/server';

describe('chats.controller', () => {
    let roomServiceMock: DeepMockProxy<RoomsService>
    let modelsServiceMock: DeepMockProxy<ModelsService>
    let chatsServiceMock: DeepMockProxy<ChatsService>
    let chatsEmitterMock: DeepMockProxy<ChatsEmitter>
    let chatsController: ChatsController

    beforeEach(() => {
        roomServiceMock = mockDeep<RoomsService>()
        modelsServiceMock = mockDeep<ModelsService>()
        chatsServiceMock = mockDeep<ChatsService>()
        chatsEmitterMock = mockDeep<ChatsEmitter>()
        chatsController = new ChatsController(roomServiceMock, modelsServiceMock, chatsServiceMock, chatsEmitterMock);

        (chatsEmitterMock as any).emitter.channel.mockImplementation(() => ({
            emit: jest.fn(),
            off: jest.fn(),
            on: jest.fn(),
        }))
    })

    test('chats', async () => {
        const res = await chatsController.chats({ id: 'ID' })
        expect(modelsServiceMock.client.room.findFirst).toBeCalled()
        expect(modelsServiceMock.client.room.findFirst).toBeCalledWith({
            where: {
                id: 'ID',
            },
            select: {
                chats: {
                    take: 20,
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        })
        expect(res).toBeDefined()
    })

    test('send', async () => {
        const chatMock = {
            userId: 'USER_ID', color: '#ABC123', id: 'ID', message: 'Test Message', name: 'Test Name'
        };

        await chatsController.send(chatMock)

        expect(modelsServiceMock.client.chat.create).toBeCalled()
        expect(modelsServiceMock.client.chat.create).toBeCalledWith({
            data: {
                name: chatMock.name,
                message: chatMock.message,
                color: chatMock.color,
                room: {
                    connect: {
                        id: chatMock.id
                    }
                },
                user: {
                    connect: {
                        id: chatMock.userId
                    }
                }
            }
        })

        expect(chatsServiceMock.convertEmoticonsToEmojisInChatsObject).toBeCalled()
    })

    test('chatSubscription', async () => {
        let maybeWillThrowError = async () => await chatsController.chatSubscription({ id: 'ID', localStorageSessionId: 1, name: 'Name', roomTransientId: 'ROOM_TRANSIENT_ID', password: 'PASSWORD' }, null)

        await expect(maybeWillThrowError).rejects.toThrow();

        ; (modelsServiceMock as any).client.room.findFirst.mockImplementation(() => ({}))

        await expect(maybeWillThrowError).rejects.toThrow();

        ; (roomServiceMock as any).isAuthorizedToEnterRoom.mockImplementation(() => true)

        await expect(maybeWillThrowError).rejects.toThrow();

        ; (modelsServiceMock as any).client.roomTransient.findFirst.mockImplementation(() => ({}))

        const res = await maybeWillThrowError()
        expect(res).toBeInstanceOf(Subscription)
    })

    afterEach(() => {
        mockClear(roomServiceMock)
        mockClear(modelsServiceMock)
        mockClear(chatsServiceMock)
        mockClear(chatsEmitterMock)
    })
})