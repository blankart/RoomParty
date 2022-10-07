import { injectable } from "inversify";
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from 'sib-api-v3-typescript'
import fs from 'fs'

interface SendEmailConfirmationParams {
    email: string,
    code: string
}

@injectable()
class EmailService {
    private sibApiV3SdkInstance: TransactionalEmailsApi
    constructor() {
        this.sibApiV3SdkInstance = new TransactionalEmailsApi()
        if (process.env.SIB_EMAIL_API_KEY) {
            this.sibApiV3SdkInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.SIB_EMAIL_API_KEY)
        }
    }

    async sendEmailConfirmation(data: SendEmailConfirmationParams) {
        const sendEmailConfirmationTemplate = fs.readFileSync('./templates/sendEmailConfirmation.template.html', 'utf-8')
        const sendSmtpEmail = new SendSmtpEmail()
        sendSmtpEmail.to = [{ email: data.email }]
        sendSmtpEmail.params = data;
        sendSmtpEmail.subject = "RoomParty Sign Up Verification Code";
        sendSmtpEmail.htmlContent = sendEmailConfirmationTemplate
        sendSmtpEmail.sender = { "name": "RoomParty", "email": "hello.roomparty@gmail.com" };
        return await this.sibApiV3SdkInstance.sendTransacEmail(sendSmtpEmail)
    }
}

export default EmailService