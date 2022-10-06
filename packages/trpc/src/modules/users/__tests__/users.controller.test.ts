import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import ModelsService from "../../models/models.service"
import UsersController from "../users.controller"
import { expect } from '@jest/globals'

describe('users.controller', () => {
    let modelsServiceMock: DeepMockProxy<ModelsService>
    let usersController: UsersController

    beforeEach(() => {
        modelsServiceMock = mockDeep<ModelsService>()
        usersController = new UsersController(modelsServiceMock)
    })

    test('me', async () => {
        await usersController.me('SAMPLE ID')
        expect(modelsServiceMock.client.account.findFirst).toBeCalled()
        expect(modelsServiceMock.client.account.findFirst).toBeCalledWith({
            where: { id: 'SAMPLE ID' },
            select: {
                id: true,
                user: true
            }
        })
    })
})