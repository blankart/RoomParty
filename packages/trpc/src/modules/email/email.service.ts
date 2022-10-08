import { injectable } from "inversify";
import * as SibApiV3Sdk from "sib-api-v3-typescript";
import fs from "fs";

interface SendEmailConfirmationParams {
  email: string;
  code: string;
}

@injectable()
class EmailService {
  private sibApiV3SdkInstance: SibApiV3Sdk.TransactionalEmailsApi;
  constructor() {
    this.sibApiV3SdkInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    if (process.env.SIB_EMAIL_API_KEY) {
      this.sibApiV3SdkInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        process.env.SIB_EMAIL_API_KEY
      );
    }
  }

  async sendEmailConfirmation(data: SendEmailConfirmationParams) {
    const sendEmailConfirmationTemplate = fs.readFileSync(
      __dirname + "/templates/sendEmailConfirmation.template.html",
      "utf-8"
    );
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: data.email }];
    sendSmtpEmail.params = data;
    sendSmtpEmail.subject = "RoomParty Sign Up Verification Code";
    sendSmtpEmail.htmlContent = sendEmailConfirmationTemplate;
    sendSmtpEmail.sender = {
      name: "RoomParty",
      email: "hello.roomparty@gmail.com",
    };
    return await this.sibApiV3SdkInstance.sendTransacEmail(sendSmtpEmail);
  }
}

export default EmailService;
