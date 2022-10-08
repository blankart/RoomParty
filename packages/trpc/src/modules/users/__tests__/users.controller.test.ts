import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import ModelsService from "../../models/models.service"
import UsersController from "../users.controller"
import { expect } from '@jest/globals'
import EmailService from "../../email/email.service"

describe('users.controller', () => {
    let modelsServiceMock: DeepMockProxy<ModelsService>
    let emailServiceMock: DeepMockProxy<EmailService>
    let usersController: UsersController

    beforeEach(() => {
        modelsServiceMock = mockDeep<ModelsService>()
        emailServiceMock = mockDeep<EmailService>()
        usersController = new UsersController(modelsServiceMock, emailServiceMock)
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