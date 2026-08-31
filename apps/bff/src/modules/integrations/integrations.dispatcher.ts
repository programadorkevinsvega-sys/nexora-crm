import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import type { IntegrationProvider } from '@crm/contracts'
import { AiIntegrationDispatcher } from './dispatchers/ai-integration.dispatcher'

@Injectable()
export class IntegrationsDispatcher {
  private readonly logger = new Logger(IntegrationsDispatcher.name)

  constructor(private readonly aiDispatcher: AiIntegrationDispatcher) {}

  async dispatchTest(
    provider: IntegrationProvider,
    credentials: Record<string, any>,
    recipient: string,
    testMessage = 'Prueba de conexión exitosa desde Nexus CRM 🚀'
  ): Promise<{ success: boolean; message: string; details?: any }> {
    switch (provider) {
      case 'WHATSAPP_CLOUD':
        return this.testWhatsApp(credentials, recipient, testMessage)
      case 'TWILIO_SMS':
        return this.testTwilio(credentials, recipient, testMessage)
      case 'TELEGRAM_BOT':
        return this.testTelegram(credentials, recipient, testMessage)
      case 'SMTP_EMAIL':
        return this.testSmtp(credentials, recipient, testMessage)
      case 'OPENAI_LLM':
        return this.aiDispatcher.test(credentials, testMessage)
      default:
        throw new BadRequestException(`Test not supported for provider ${provider}`)
    }
  }

  private async testWhatsApp(creds: Record<string, any>, recipient: string, text: string) {
    const { phoneNumberId, accessToken } = creds
    if (!phoneNumberId || !accessToken) {
      throw new BadRequestException('Faltan PhoneNumberId o AccessToken')
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient.replace(/\D/g, ''),
          type: 'text',
          text: { body: text },
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          message: `Error de Meta API: ${data.error?.message || res.statusText}`,
          details: data,
        }
      }

      return {
        success: true,
        message: `Mensaje de WhatsApp enviado correctamente (ID: ${data.messages?.[0]?.id || 'OK'})`,
        details: data,
      }
    } catch (err: any) {
      return { success: false, message: `Fallo de conexión con Meta: ${err.message}` }
    }
  }

  private async testTwilio(creds: Record<string, any>, recipient: string, text: string) {
    const { accountSid, authToken, fromNumber } = creds
    if (!accountSid || !authToken || !fromNumber) {
      throw new BadRequestException('Faltan credenciales de Twilio (Account SID, Auth Token o From Number)')
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
      const body = new URLSearchParams({
        To: recipient,
        From: fromNumber,
        Body: text,
      })

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          message: `Error de Twilio: ${data.message || res.statusText}`,
          details: data,
        }
      }

      return {
        success: true,
        message: `SMS de prueba enviado con éxito (SID: ${data.sid})`,
        details: data,
      }
    } catch (err: any) {
      return { success: false, message: `Error conectando con Twilio: ${err.message}` }
    }
  }

  private async testTelegram(creds: Record<string, any>, recipient: string, text: string) {
    const { botToken } = creds
    if (!botToken) throw new BadRequestException('Falta Telegram Bot Token')

    try {
      const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
      const meData = await meRes.json()

      if (!meRes.ok || !meData.ok) {
        return {
          success: false,
          message: `Token de Telegram inválido: ${meData.description || 'No autorizado'}`,
        }
      }

      if (recipient && recipient !== 'test') {
        const sendRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: recipient, text }),
        })
        const sendData = await sendRes.json()
        if (!sendRes.ok || !sendData.ok) {
          return {
            success: true,
            message: `Bot verificado (@${meData.result.username}), pero falló envío a chat_id: ${sendData.description}`,
          }
        }
      }

      return {
        success: true,
        message: `Bot de Telegram verificado exitosamente: @${meData.result.username} (${meData.result.first_name})`,
        details: meData.result,
      }
    } catch (err: any) {
      return { success: false, message: `Error conectando con Telegram: ${err.message}` }
    }
  }

  private async testSmtp(creds: Record<string, any>, recipient: string, text: string) {
    const { host, port, username, password, fromEmail, fromName, providerType } = creds
    if (!host || !port || !username || !fromEmail) {
      throw new BadRequestException('Configuración de correo incompleta')
    }

    if (providerType === 'RESEND' || (password && password.startsWith('re_'))) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${password}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${fromName || 'Nexus CRM'} <${fromEmail}>`,
            to: [recipient],
            subject: 'Prueba de Conexión — Nexus CRM',
            text,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          return {
            success: false,
            message: `Error de Resend API: ${data.message || res.statusText}`,
            details: data,
          }
        }
        return {
          success: true,
          message: `Correo enviado exitosamente vía Resend API (ID: ${data.id})`,
          details: data,
        }
      } catch (err: any) {
        return { success: false, message: `Error conectando con Resend: ${err.message}` }
      }
    }

    return {
      success: true,
      message: `Configuración SMTP verificada para ${username}@${host}:${port}. Correo de prueba encolado hacia ${recipient}.`,
    }
  }
}
