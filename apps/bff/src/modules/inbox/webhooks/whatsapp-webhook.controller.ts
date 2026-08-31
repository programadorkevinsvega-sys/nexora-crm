import { Controller, Get, Post, Body, Query, Res, Logger } from '@nestjs/common'
import { Response } from 'express'
import { getDb, whatsappMessages, contacts } from '@crm/database'
import { eq, ilike } from 'drizzle-orm'
import { CacheService } from '../../../common/cache/cache.service'

@Controller('api/webhooks/whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name)

  constructor(private readonly cache: CacheService) {}

  private get db() {
    return getDb()
  }

  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'nexora_whatsapp_verify_token'
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp Meta Webhook verified successfully 🚀')
      res.status(200).send(challenge)
    } else {
      this.logger.warn(`WhatsApp webhook verification failed. Token received: ${token}`)
      res.status(403).send('Forbidden')
    }
  }

  @Post()
  async receive(@Body() body: Record<string, any>, @Res() res: Response) {
    try {
      const entry = body?.entry?.[0]
      const change = entry?.changes?.[0]
      const value = change?.value
      const message = value?.messages?.[0]

      if (message?.from && (message?.text?.body || message?.type)) {
        const from: string = message.from
        const text: string = message.text?.body || `[${message.type?.toUpperCase() || 'ARCHIVO'}]`
        const tenantId = '00000000-0000-0000-0000-000000000001'

        this.logger.log(`WhatsApp INBOUND message received from +${from}: "${text}"`)

        // Match contact by phone suffix
        let contactId: string | null = null
        const cleanPhone = from.replace(/\D/g, '')
        const phoneTail = cleanPhone.slice(-8)

        const [foundContact] = await this.db
          .select({ id: contacts.id })
          .from(contacts)
          .where(ilike(contacts.phone, `%${phoneTail}%`))
          .limit(1)

        if (foundContact) {
          contactId = foundContact.id
        }

        // Store inbound message directly in database
        await this.db.insert(whatsappMessages).values({
          id: crypto.randomUUID(),
          tenantId,
          contactId,
          direction: 'INBOUND',
          phoneNumber: from,
          messageBody: text,
          status: 'DELIVERED',
          sentAt: new Date(),
        })

        // Invalidate inbox cache so real-time polling reflects new message
        await this.cache.invalidate('inbox:')
      }
    } catch (err: any) {
      this.logger.error(`WhatsApp webhook error: ${err.message}`, err.stack)
    }

    res.status(200).json({ status: 'ok' })
  }
}
