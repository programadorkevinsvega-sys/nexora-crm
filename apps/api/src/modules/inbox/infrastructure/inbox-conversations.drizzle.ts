/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, desc } from 'drizzle-orm'
import {
  getDb,
  contacts,
  whatsappMessages,
  emails,
  leadScores,
} from '@crm/database'
import { InboxConversation } from '../domain/entities/inbox-conversation.entity'
import { InboxMessage } from '../domain/entities/inbox-message.entity'
import { InboxChannel, InboxConversationStatus } from '@crm/contracts'

export class InboxConversationsDrizzleHelper {
  private static get db() { return getDb() }

  static async listConversations(
    tenantId: string,
    filters?: { channel?: InboxChannel; status?: InboxConversationStatus },
  ): Promise<InboxConversation[]> {
    const conversations: InboxConversation[] = []

    if (!filters?.channel || filters.channel === 'WHATSAPP') {
      const waRows = await this.db
        .select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.tenantId, tenantId))
        .orderBy(desc(whatsappMessages.sentAt))

      const groupedByPhone = new Map<string, typeof waRows>()
      for (const row of waRows) {
        const key = row.phoneNumber
        if (!groupedByPhone.has(key)) groupedByPhone.set(key, [])
        groupedByPhone.get(key)!.push(row)
      }

      for (const [phone, msgs] of groupedByPhone.entries()) {
        const latest = msgs[0]
        const contactId = latest.contactId
        let contactName = phone
        let score = 0
        let temp: 'COLD' | 'WARM' | 'HOT' = 'COLD'

        if (contactId) {
          const c = await this.db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1)
          if (c.length > 0) contactName = `${c[0].firstName} ${c[0].lastName ?? ''}`.trim()
          const sc = await this.db.select().from(leadScores).where(eq(leadScores.contactId, contactId)).limit(1)
          if (sc.length > 0) {
            score = sc[0].score
            temp = sc[0].temperature as any
          }
        }

        conversations.push(
          new InboxConversation(
            latest.id,
            tenantId,
            'WHATSAPP',
            contactId ?? null,
            contactName,
            null,
            phone,
            score,
            temp,
            `Chat de WhatsApp (${phone})`,
            'OPEN',
            latest.messageBody,
            latest.sentAt ?? new Date(),
            msgs.filter((m) => m.direction === 'INBOUND' && m.status !== 'READ').length,
            null,
            msgs.map(
              (m) =>
                new InboxMessage(
                  m.id,
                  latest.id,
                  'WHATSAPP',
                  (m.direction as any) || 'OUTBOUND',
                  m.direction === 'INBOUND' ? contactName : 'Agente',
                  m.direction === 'INBOUND' ? phone : 'Sistema',
                  m.direction === 'INBOUND' ? 'Sistema' : phone,
                  m.messageBody,
                  null,
                  (m.status as any) || 'DELIVERED',
                  m.sentAt ?? new Date(),
                ),
            ),
          ),
        )
      }
    }

    if (!filters?.channel || filters.channel === 'EMAIL') {
      const emailRows = await this.db
        .select()
        .from(emails)
        .where(eq(emails.tenantId, tenantId))
        .orderBy(desc(emails.sentAt))

      const groupedByContact = new Map<string, typeof emailRows>()
      for (const row of emailRows) {
        const key = row.contactId || row.toAddress
        if (!groupedByContact.has(key)) groupedByContact.set(key, [])
        groupedByContact.get(key)!.push(row)
      }

      for (const emList of groupedByContact.values()) {
        const latest = emList[0]
        let contactName = latest.toAddress
        let score = 0
        let temp: 'COLD' | 'WARM' | 'HOT' = 'COLD'

        if (latest.contactId) {
          const c = await this.db.select().from(contacts).where(eq(contacts.id, latest.contactId)).limit(1)
          if (c.length > 0) contactName = `${c[0].firstName} ${c[0].lastName ?? ''}`.trim()
          const sc = await this.db.select().from(leadScores).where(eq(leadScores.contactId, latest.contactId)).limit(1)
          if (sc.length > 0) {
            score = sc[0].score
            temp = sc[0].temperature as any
          }
        }

        conversations.push(
          new InboxConversation(
            latest.id,
            tenantId,
            'EMAIL',
            latest.contactId ?? null,
            contactName,
            latest.toAddress,
            null,
            score,
            temp,
            latest.subject || 'Conversación de Correo',
            'OPEN',
            latest.bodyText || latest.bodyHtml || 'Sin contenido',
            latest.sentAt ?? new Date(),
            0,
            null,
            emList.map(
              (e) =>
                new InboxMessage(
                  e.id,
                  latest.id,
                  'EMAIL',
                  (e.direction as any) || 'OUTBOUND',
                  e.fromAddress,
                  e.fromAddress,
                  e.toAddress,
                  e.bodyText || '',
                  e.bodyHtml ?? null,
                  (e.status as any) || 'SENT',
                  e.sentAt ?? new Date(),
                ),
            ),
          ),
        )
      }
    }

    conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
    return conversations
  }

  static async getConversation(tenantId: string, id: string): Promise<InboxConversation | null> {
    const list = await this.listConversations(tenantId)
    return list.find((c) => c.id === id) || null
  }
}
