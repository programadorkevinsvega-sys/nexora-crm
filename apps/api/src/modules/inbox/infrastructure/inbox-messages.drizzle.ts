import { getDb, whatsappMessages, emails } from '@crm/database'
import { InboxMessage } from '../domain/entities/inbox-message.entity'
import { InboxChannel } from '@crm/contracts'

export class InboxMessagesDrizzleHelper {
  private static get db() { return getDb() }

  static async sendMessage(
    tenantId: string,
    data: {
      conversationId?: string
      contactId?: string
      channel: InboxChannel
      recipientIdentifier: string
      subject?: string
      bodyText: string
    },
  ): Promise<InboxMessage> {
    const msgId = crypto.randomUUID()
    const now = new Date()

    if (data.channel === 'WHATSAPP') {
      await this.db.insert(whatsappMessages).values({
        id: msgId,
        tenantId,
        contactId: data.contactId || null,
        direction: 'OUTBOUND',
        phoneNumber: data.recipientIdentifier,
        messageBody: data.bodyText,
        status: 'DELIVERED',
        sentAt: now,
      })
    } else {
      await this.db.insert(emails).values({
        id: msgId,
        tenantId,
        contactId: data.contactId || null,
        direction: 'OUTBOUND',
        fromAddress: 'soporte@nexora-crm.com',
        toAddress: data.recipientIdentifier,
        subject: data.subject || 'Mensaje de Nexora CRM',
        bodyText: data.bodyText,
        status: 'SENT',
        sentAt: now,
      })
    }

    return new InboxMessage(
      msgId,
      data.conversationId || msgId,
      data.channel,
      'OUTBOUND',
      'Agente Nexora',
      'soporte@nexora-crm.com',
      data.recipientIdentifier,
      data.bodyText,
      null,
      'DELIVERED',
      now,
    )
  }
}
