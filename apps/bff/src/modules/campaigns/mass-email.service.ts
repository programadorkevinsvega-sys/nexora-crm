import { Injectable, Logger } from '@nestjs/common'
import { SmtpEmailDispatcher } from '../integrations/dispatchers/smtp-email.dispatcher'
import { errorMessage, type IntegrationCredentials } from '../integrations/dispatchers/dispatcher-utils'

@Injectable()
export class MassEmailService {
  private readonly logger = new Logger(MassEmailService.name)

  constructor(
    private readonly smtpDispatcher: SmtpEmailDispatcher,
  ) {}

  async sendBulk(
    creds: IntegrationCredentials,
    recipients: string[],
    subject: string,
    htmlTemplate: string,
  ): Promise<{ sent: number; failed: number }> {
    return this.smtpDispatcher.sendBulkMail(creds, recipients, subject, htmlTemplate)
  }

  async sendTest(
    creds: IntegrationCredentials,
    recipient: string,
    subject: string,
    html: string,
  ): Promise<{ success: boolean; messageId?: string; message?: string }> {
    try {
      return await this.smtpDispatcher.sendEmail(creds, recipient, subject, html)
    } catch (error: unknown) {
      return { success: false, message: errorMessage(error) }
    }
  }
}
