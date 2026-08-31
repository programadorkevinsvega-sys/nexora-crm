import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import type { IntegrationProvider } from '@crm/contracts'
import { AiIntegrationDispatcher } from './dispatchers/ai-integration.dispatcher'
import { SmtpEmailDispatcher } from './dispatchers/smtp-email.dispatcher'
import { AwsSesDispatcher } from './dispatchers/aws-ses.dispatcher'
import { StripeDispatcher } from './dispatchers/stripe.dispatcher'
import { SlackDispatcher } from './dispatchers/slack.dispatcher'
import { ShopifyDispatcher } from './dispatchers/shopify.dispatcher'
import { HubSpotDispatcher } from './dispatchers/hubspot.dispatcher'
import { ZapierMakeDispatcher } from './dispatchers/zapier-make.dispatcher'
import { GoogleWorkspaceDispatcher } from './dispatchers/google-workspace.dispatcher'

@Injectable()
export class IntegrationsDispatcher {
  private readonly logger = new Logger(IntegrationsDispatcher.name)

  constructor(
    private readonly aiDispatcher: AiIntegrationDispatcher,
    private readonly smtpDispatcher: SmtpEmailDispatcher,
    private readonly sesDispatcher: AwsSesDispatcher,
    private readonly stripeDispatcher: StripeDispatcher,
    private readonly slackDispatcher: SlackDispatcher,
    private readonly shopifyDispatcher: ShopifyDispatcher,
    private readonly hubspotDispatcher: HubSpotDispatcher,
    private readonly zapierDispatcher: ZapierMakeDispatcher,
    private readonly googleDispatcher: GoogleWorkspaceDispatcher,
  ) {}

  async dispatchTest(
    provider: IntegrationProvider,
    credentials: Record<string, any>,
    recipient: string,
    testMessage = 'Prueba de conexión exitosa desde Nexora CRM 🚀',
  ): Promise<{ success: boolean; message: string; details?: any }> {
    this.logger.log(`Testing integration: ${provider}`)

    switch (provider) {
      case 'WHATSAPP_CLOUD':
        return this.testWhatsApp(credentials, recipient, testMessage)

      case 'TWILIO_SMS':
        return this.testTwilio(credentials, recipient, testMessage)

      case 'TELEGRAM_BOT':
        return this.testTelegram(credentials, recipient, testMessage)

      case 'SMTP_EMAIL':
      case 'SENDGRID':
        return this.smtpDispatcher.test(credentials, recipient, testMessage)

      case 'AWS_SES':
        return this.sesDispatcher.test(credentials, recipient, testMessage)

      case 'STRIPE':
        return this.stripeDispatcher.test(credentials, recipient, testMessage)

      case 'SLACK_APP':
        return this.slackDispatcher.test(credentials, recipient, testMessage)

      case 'SHOPIFY_STORE':
        return this.shopifyDispatcher.test(credentials, recipient, testMessage)

      case 'HUBSPOT_SYNC':
        return this.hubspotDispatcher.test(credentials, recipient, testMessage)

      case 'ZAPIER_MAKE':
        return this.zapierDispatcher.test(credentials, recipient, testMessage)

      case 'GOOGLE_WORKSPACE':
        return this.googleDispatcher.test(credentials, recipient, testMessage)

      case 'OPENAI_LLM':
        return this.aiDispatcher.test(credentials, testMessage)

      case 'MICROSOFT_365':
        return {
          success: true,
          message: 'Credenciales de Microsoft 365 guardadas. La sincronización OAuth2 con Outlook estará disponible en la próxima versión.',
        }

      case 'META_FACEBOOK_LEADS':
        return {
          success: true,
          message: 'Meta Facebook Lead Ads ya está conectado a través del módulo dedicado. Dirígete al panel de Facebook Ads para gestionar la integración.',
        }

      default:
        throw new BadRequestException(`Proveedor desconocido: ${provider}`)
    }
  }

  // ─── Channel dispatchers kept inline (already use real APIs) ──────────────

  private async testWhatsApp(creds: Record<string, any>, recipient: string, text: string) {
    const { phoneNumberId, accessToken } = creds
    if (!phoneNumberId || !accessToken) {
      throw new BadRequestException('Faltan PhoneNumberId o AccessToken de WhatsApp Cloud API')
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
          message: `Error de Meta API: ${(data as any).error?.message || res.statusText}`,
          details: data,
        }
      }

      return {
        success: true,
        message: `Mensaje de WhatsApp enviado correctamente a +${recipient.replace(/\D/g, '')} (ID: ${(data as any).messages?.[0]?.id || 'OK'})`,
        details: data,
      }
    } catch (err: any) {
      return { success: false, message: `Fallo de conexión con Meta Graph API: ${err.message}` }
    }
  }

  private async testTwilio(creds: Record<string, any>, recipient: string, text: string) {
    const { accountSid, authToken, fromNumber } = creds
    if (!accountSid || !authToken || !fromNumber) {
      throw new BadRequestException('Faltan AccountSid, AuthToken o FromNumber de Twilio')
    }

    try {
      const body = new URLSearchParams({ To: recipient, From: fromNumber, Body: text })
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        },
      )

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          message: `Error de Twilio: ${(data as any).message || res.statusText}`,
          details: data,
        }
      }

      return {
        success: true,
        message: `SMS enviado vía Twilio a ${recipient} (SID: ${(data as any).sid})`,
        details: data,
      }
    } catch (err: any) {
      return { success: false, message: `Error conectando con Twilio: ${err.message}` }
    }
  }

  private async testTelegram(creds: Record<string, any>, recipient: string, text: string) {
    const { botToken } = creds
    if (!botToken) throw new BadRequestException('Falta Bot Token de Telegram')

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: recipient, text }),
      })

      const data = await res.json()
      if (!(data as any).ok) {
        return {
          success: false,
          message: `Error de Telegram: ${(data as any).description || 'No se pudo enviar'}`,
          details: data,
        }
      }

      return {
        success: true,
        message: `Mensaje enviado al chat ${recipient} vía Telegram Bot`,
        details: data,
      }
    } catch (err: any) {
      return { success: false, message: `Error conectando con Telegram: ${err.message}` }
    }
  }
}
