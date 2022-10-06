import { describe, expect, test, jest } from '@jest/globals';
import { mockDeep, mockClear, DeepMockProxy } from 'jest-mock-extended'
import type ModelsService from '../../models/models.service';
import type RoomsService from '../../rooms/rooms.service';
import type PlayerEmitter from '../player.emitter';
import type PlayerService from '../player.service';
import PlayerController from '../player.controller'
import { Subscription } from '@trpc/server';

describe('player.controller', () => {
    let modelsServiceMock: DeepMockProxy<ModelsService>
    let playerServiceMock: DeepMockProxy<PlayerService>
    let playerEmitterMock: DeepMockProxy<PlayerEmitter>

    let playerController: PlayerController

    beforeEach(() => {
        modelsServiceMock = mockDeep<ModelsService>()
        playerServiceMock = mockDeep<PlayerService>()
        playerEmitterMock = mockDeep<PlayerEmitter>();

        (playerEmitterMock as any).emitter.channel.mockImplementation(() => ({
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn()
        }))

        playerController = new PlayerController(modelsServiceMock, playerServiceMock, playerEmitterMock);

    })

    test('statusSubscription', async () => {
        expect(await playerController.statusSubscription({ id: 'ID', name: 'NAME' })).toBeInstanceOf(Subscription)
    })

    afterEach(() => {
        mockClear(modelsServiceMock)
        mockClear(playerServiceMock)
        mockClear(playerEmitterMock)
    })
})