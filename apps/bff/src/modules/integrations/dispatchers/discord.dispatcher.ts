import { Injectable, Logger, BadRequestException } from '@nestjs/common'

export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number // hex integer
  fields?: Array<{ name: string; value: string; inline?: boolean }>
  footer?: { text: string }
  timestamp?: string
}

@Injectable()
export class DiscordDispatcher {
  private readonly logger = new Logger(DiscordDispatcher.name)

  async test(credentials: Record<string, any>, recipient?: string, testMsg?: string) {
    const webhookUrl = credentials.webhookUrl || credentials.url
    if (!webhookUrl) {
      throw new BadRequestException('Falta la URL de Webhook de Discord')
    }

    const payload = {
      username: credentials.botName || 'Nexora CRM Bot',
      avatar_url: credentials.avatarUrl || 'https://assets.nexora-crm.com/logo.png',
      content: testMsg || '🚀 Conexión exitosa entre Nexora CRM y Discord!',
      embeds: [
        {
          title: '🟢 Canal Conectado en Vivo',
          description: 'Este canal de Discord ahora recibirá alertas automáticas de ventas, leads y tickets.',
          color: 0x06b6d4, // Cyan
          fields: [
            { name: 'Entorno', value: 'Producción', inline: true },
            { name: 'Destinatario / Canal', value: recipient || 'Default', inline: true },
          ],
          footer: { text: 'Nexora CRM Automation Engine' },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    return this.sendMessage(webhookUrl, payload)
  }

  async sendMessage(webhookUrl: string, payload: { content?: string; username?: string; avatar_url?: string; embeds?: DiscordEmbed[] }) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Discord API error ${res.status}: ${text}`)
      }

      this.logger.log('Native Discord notification dispatched successfully')
      return {
        success: true,
        message: 'Mensaje enviado a Discord correctamente',
      }
    } catch (err: any) {
      this.logger.error(`Discord dispatch failed: ${err.message}`)
      return { success: false, message: `Error enviando a Discord: ${err.message}` }
    }
  }

  async postDealAlert(webhookUrl: string, deal: { name: string; amount: number; stage: string; contactName?: string }) {
    return this.sendMessage(webhookUrl, {
      username: 'Nexora Sales Bot',
      embeds: [
        {
          title: '🎉 ¡Nuevo Deal Comercial Ganado!',
          description: `El trato **${deal.name}** ha pasado a etapa **${deal.stage}**.`,
          color: 0x10b981, // Emerald green
          fields: [
            { name: 'Monto de Venta', value: `$${deal.amount.toLocaleString()} USD`, inline: true },
            { name: 'Cliente', value: deal.contactName || 'No asignado', inline: true },
          ],
          footer: { text: 'Nexora CRM Deals Pipeline' },
          timestamp: new Date().toISOString(),
        },
      ],
    })
  }
}
