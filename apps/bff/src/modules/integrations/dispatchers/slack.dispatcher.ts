import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { WebClient } from '@slack/web-api'

@Injectable()
export class SlackDispatcher {
  private readonly logger = new Logger(SlackDispatcher.name)

  private buildClient(botToken: string): WebClient {
    if (!botToken || !botToken.startsWith('xoxb-')) {
      throw new BadRequestException('Slack Bot Token inválido. Debe comenzar con xoxb-')
    }
    return new WebClient(botToken)
  }

  async test(
    creds: Record<string, any>,
    _recipient: string,
    text: string,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const { botToken, defaultChannel, notifyWonDeals, notifyNewLeads } = creds

    if (!botToken) throw new BadRequestException('Slack Bot Token es requerido')

    const slack = this.buildClient(botToken)
    const channel = (defaultChannel || 'general').replace(/^#/, '')

    try {
      const auth = await slack.auth.test()
      if (!auth.ok) {
        return { success: false, message: `Token de Slack inválido: ${auth.error}` }
      }

      const result = await slack.chat.postMessage({
        channel,
        text: `✅ *Nexora CRM conectado* — ${text}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ *Nexora CRM integrado con Slack*\n${text}\n\n_Alertas: Deals ganados=${notifyWonDeals ?? true}, Nuevos leads=${notifyNewLeads ?? true}_`,
            },
          },
        ],
      })

      this.logger.log(`Slack test message sent to #${channel}: ts=${result.ts}`)
      return {
        success: true,
        message: `Mensaje enviado al canal #${channel} en workspace "${auth.team}" (bot: ${auth.user})`,
        details: { team: auth.team, channel, ts: result.ts },
      }
    } catch (err: any) {
      const code = (err as any).data?.error || err.message
      return {
        success: false,
        message: `Error de Slack (${code}): Verifica que el bot esté invitado al canal #${channel}`,
      }
    }
  }

  async postDealNotification(
    botToken: string,
    channel: string,
    dealTitle: string,
    amount: number,
    currency: string,
    owner: string,
  ): Promise<void> {
    const slack = this.buildClient(botToken)
    await slack.chat.postMessage({
      channel: channel.replace(/^#/, ''),
      text: `🎉 Deal ganado: ${dealTitle}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🎉 *Deal Ganado!*\n*${dealTitle}*\nValor: ${currency} ${amount.toLocaleString()}\nResponsable: ${owner}`,
          },
        },
      ],
    })
  }
}
