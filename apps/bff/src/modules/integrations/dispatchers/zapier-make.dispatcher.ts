import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { credentialString, errorMessage, errorName, type IntegrationCredentials } from './dispatcher-utils'

@Injectable()
export class ZapierMakeDispatcher {
  private readonly logger = new Logger(ZapierMakeDispatcher.name)
  async test(creds: IntegrationCredentials, _recipient: string, _text: string): Promise<{ success: boolean; message: string; details?: unknown }> {
    const webhookUrl = credentialString(creds, 'webhookUrl')
    const rawEvents = creds.enabledEvents
    const enabledEvents = Array.isArray(rawEvents) && rawEvents.every((entry): entry is string => typeof entry === 'string')
      ? rawEvents : ['contact.created', 'deal.won']
    if (!webhookUrl) throw new BadRequestException('Webhook URL es requerida')
    const testPayload = {
      event: 'nexora.webhook.test', timestamp: new Date().toISOString(), source: 'Nexora CRM',
      data: { message: 'Prueba de conexión exitosa desde Nexora CRM 🚀', enabledEvents, version: '1.0' },
    }
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'NexoraCRM-Webhook/1.0' },
        body: JSON.stringify(testPayload), signal: AbortSignal.timeout(15_000),
      })
      const responseText = await res.text().catch(() => '')
      if (!res.ok && res.status !== 202) {
        return { success: false, message: `Webhook devolvió error HTTP ${res.status}: ${responseText.slice(0, 200)}` }
      }
      const platform = this.detectPlatform(webhookUrl)
      this.logger.log(`Webhook test OK: ${webhookUrl} → HTTP ${res.status} (${platform})`)
      return {
        success: true,
        message: `Webhook activado correctamente (HTTP ${res.status}). Trigger recibido por ${platform}. Eventos: ${enabledEvents.join(', ')}`,
        details: { webhookUrl, httpStatus: res.status, platform, sentPayload: testPayload },
      }
    } catch (err: unknown) {
      if (errorName(err) === 'TimeoutError') return { success: false, message: `Timeout: El webhook no respondió en 15s (${webhookUrl})` }
      return { success: false, message: `No se pudo alcanzar el webhook: ${errorMessage(err)}` }
    }
  }
  async trigger(webhookUrl: string, event: string, data: Record<string, unknown>, apiKey?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'User-Agent': 'NexoraCRM-Webhook/1.0' }
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`
    const response = await fetch(webhookUrl, {
      method: 'POST', headers, body: JSON.stringify({ event, timestamp: new Date().toISOString(), data }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`Webhook delivery failed with HTTP ${response.status}`)
  }
  private detectPlatform(url: string): string {
    if (url.includes('hooks.zapier.com')) return 'Zapier'
    if (url.includes('hook.eu') || url.includes('hook.us') || url.includes('make.com')) return 'Make.com'
    if (url.includes('n8n.io') || url.includes('/webhook/')) return 'n8n'
    return 'Webhook externo'
  }
}
