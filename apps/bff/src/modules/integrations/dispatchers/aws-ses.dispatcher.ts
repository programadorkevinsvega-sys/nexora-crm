import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { SESClient, SendEmailCommand, GetAccountSendingEnabledCommand } from '@aws-sdk/client-ses'
import { credentialString, errorMessage, type IntegrationCredentials } from './dispatcher-utils'

@Injectable()
export class AwsSesDispatcher {
  private readonly logger = new Logger(AwsSesDispatcher.name)
  private buildClient(creds: IntegrationCredentials): SESClient {
    const accessKeyId = credentialString(creds, 'accessKeyId')
    const secretAccessKey = credentialString(creds, 'secretAccessKey')
    if (!accessKeyId || !secretAccessKey) throw new BadRequestException('AWS Access Key ID y Secret Access Key son requeridos')
    return new SESClient({ region: credentialString(creds, 'region') || 'us-east-1', credentials: { accessKeyId, secretAccessKey } })
  }
  async test(creds: IntegrationCredentials, recipient: string, text: string): Promise<{ success: boolean; message: string; details?: unknown }> {
    const fromEmail = credentialString(creds, 'fromEmail')
    const fromName = credentialString(creds, 'fromName') || 'Nexora CRM'
    const region = credentialString(creds, 'region') || 'us-east-1'
    if (!fromEmail) throw new BadRequestException('fromEmail verificado es requerido para AWS SES')
    const client = this.buildClient(creds)
    try { await client.send(new GetAccountSendingEnabledCommand({})) }
    catch (err: unknown) { return { success: false, message: `Error autenticando con AWS SES (${region}): ${errorMessage(err)}` } }
    try {
      const result = await client.send(new SendEmailCommand({
        Source: `${fromName} <${fromEmail}>`, Destination: { ToAddresses: [recipient] },
        Message: {
          Subject: { Data: '✅ Prueba de Conexión — Nexora CRM', Charset: 'UTF-8' },
          Body: {
            Text: { Data: text, Charset: 'UTF-8' },
            Html: { Data: `<p>${text}</p><hr/><small>Enviado desde Nexora CRM vía Amazon SES (${region})</small>`, Charset: 'UTF-8' },
          },
        },
      }))
      this.logger.log(`AWS SES test email sent: MessageId=${result.MessageId}`)
      return { success: true, message: `Email enviado vía Amazon SES (${region}) a ${recipient} (ID: ${result.MessageId})`,
        details: { messageId: result.MessageId, region } }
    } catch (err: unknown) {
      return { success: false, message: `SES SendEmail falló: ${errorMessage(err)}. ¿Está verificado el remitente ${fromEmail}?` }
    }
  }
  async sendEmail(creds: IntegrationCredentials, to: string, subject: string, html: string): Promise<{ success: boolean; messageId?: string }> {
    const fromEmail = credentialString(creds, 'fromEmail')
    const fromName = credentialString(creds, 'fromName') || 'Nexora CRM'
    if (!fromEmail) throw new BadRequestException('fromEmail es requerido para AWS SES')
    const client = this.buildClient(creds)
    const result = await client.send(new SendEmailCommand({
      Source: `${fromName} <${fromEmail}>`, Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' }, Text: { Data: html.replace(/<[^>]+>/g, ''), Charset: 'UTF-8' } },
      },
    }))
    return { success: true, messageId: result.MessageId }
  }
}
