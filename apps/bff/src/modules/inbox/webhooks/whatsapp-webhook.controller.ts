import { Controller, Get, Post, Body, Query, Res, Logger } from '@nestjs/common'
import type { Response } from 'express'
import { ApiCoreGrpcClient } from '../../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../../common/cache/cache.service'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function firstRecord(value: unknown): Record<string, unknown> {
  return Array.isArray(value) ? asRecord(value[0]) : {}
}

@Controller('api/webhooks/whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name)
  constructor(
    private readonly cache: CacheService,
    private readonly api: ApiCoreGrpcClient,
  ) {}

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
      return
    }
    this.logger.warn('WhatsApp webhook verification failed')
    res.status(403).send('Forbidden')
  }

  @Post()
  async receive(@Body() body: unknown, @Res() res: Response): Promise<void> {
    try {
      const entry = firstRecord(asRecord(body).entry)
      const change = firstRecord(entry.changes)
      const value = asRecord(change.value)
      const message = firstRecord(value.messages)
      const from = typeof message.from === 'string' ? message.from : undefined
      const messageText = asRecord(message.text)
      const rawText = typeof messageText.body === 'string' ? messageText.body : undefined
      const type = typeof message.type === 'string' ? message.type : 'archivo'

      if (from && (rawText || type)) {
        const text = rawText || `[${type.toUpperCase()}]`
        const tenantId = '00000000-0000-0000-0000-000000000001'
        this.logger.log(`WhatsApp INBOUND message received from +${from}: "${text}"`)
        let contactId: string | undefined
        const phoneTail = from.replace(/\D/g, '').slice(-8)
        try {
          const contactResult = await this.api.listContacts({ tenantId, search: phoneTail, limit: 1 })
          if (contactResult.data.length > 0) contactId = contactResult.data[0].id
        } catch {
          // Contact lookup is intentionally non-blocking for inbound message ingestion.
        }
        await this.api.sendInboxMessage({
          tenantId, channel: 'WHATSAPP', recipientIdentifier: from, bodyText: text, contactId,
        })
        await this.cache.invalidate('inbox:')
      }
    } catch (error: unknown) {
      this.logger.error(`WhatsApp webhook error: ${error instanceof Error ? error.message : String(error)}`)
    }
    res.status(200).json({ status: 'ok' })
  }
}