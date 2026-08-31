import { EmailProvider, SendEmailOptions, SendResult } from './interfaces'

export class AwsSesEmailProvider implements EmailProvider {
  readonly name = 'SES'

  async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const { SESv2 } = await import('@aws-sdk/client-sesv2')
      const region = process.env.AWS_REGION || 'us-east-1'
      const ses = new SESv2({ region })
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to]
      const result = await ses.sendEmail({
        FromEmailAddress: options.from,
        Destination: { ToAddresses: toAddresses },
        Content: {
          Simple: {
            Subject: { Data: options.subject },
            Body: options.isHtml
              ? { Html: { Data: options.body } }
              : { Text: { Data: options.body } },
          },
        },
      })
      return { success: true, provider: this.name, providerMessageId: result.MessageId }
    } catch (error: any) {
      return { success: false, provider: this.name, error: error.message ?? String(error) }
    }
  }
}
