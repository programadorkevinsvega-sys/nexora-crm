import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import {
  SESClient,
  SendEmailCommand,
  GetAccountSendingEnabledCommand,
} from '@aws-sdk/client-ses'

@Injectable()
export class AwsSesDispatcher {
  private readonly logger = new Logger(AwsSesDispatcher.name)

  private buildClient(creds: Record<string, any>): SESClient {
    const { accessKeyId, secretAccessKey, region } = creds
    if (!accessKeyId || !secretAccessKey) {
      throw new BadRequestException('AWS Access Key ID y Secret Access Key son requeridos')
    }
    return new SESClient({
      region: region || 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  async test(
    creds: Record<string, any>,
    recipient: string,
    text: string,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const { fromEmail, fromName, region } = creds
    if (!fromEmail) throw new BadRequestException('fromEmail verificado es requerido para AWS SES')

    const client = this.buildClient(creds)

    try {
      await client.send(new GetAccountSendingEnabledCommand({}))
    } catch (err: any) {
      return {
        success: false,
        message: `Error autenticando con AWS SES (${region || 'us-east-1'}): ${err.message}`,
      }
    }

    try {
      const command = new SendEmailCommand({
        Source: `${fromName || 'Nexora CRM'} <${fromEmail}>`,
        Destination: { ToAddresses: [recipient] },
        Message: {
          Subject: { Data: '✅ Prueba de Conexión — Nexora CRM', Charset: 'UTF-8' },
          Body: {
            Text: { Data: text, Charset: 'UTF-8' },
            Html: {
              Data: `<p>${text}</p><hr/><small>Enviado desde Nexora CRM vía Amazon SES (${region || 'us-east-1'})</small>`,
              Charset: 'UTF-8',
            },
          },
        },
      })

      const result = await client.send(command)
      this.logger.log(`AWS SES test email sent: MessageId=${result.MessageId}`)
      return {
        success: true,
        message: `Email enviado vía Amazon SES (${region || 'us-east-1'}) a ${recipient} (ID: ${result.MessageId})`,
        details: { messageId: result.MessageId, region: region || 'us-east-1' },
      }
    } catch (err: any) {
      return {
        success: false,
        message: `SES SendEmail falló: ${err.message}. ¿Está verificado el remitente ${fromEmail}?`,
      }
    }
  }

  async sendEmail(
    creds: Record<string, any>,
    to: string,
    subject: string,
    html: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const { fromEmail, fromName } = creds
    const client = this.buildClient(creds)

    const result = await client.send(
      new SendEmailCommand({
        Source: `${fromName || 'Nexora CRM'} <${fromEmail}>`,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: html, Charset: 'UTF-8' },
            Text: { Data: html.replace(/<[^>]+>/g, ''), Charset: 'UTF-8' },
          },
        },
      }),
    )
    return { success: true, messageId: result.MessageId }
  }
}
