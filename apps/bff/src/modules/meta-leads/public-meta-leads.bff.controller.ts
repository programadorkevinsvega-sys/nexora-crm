import { Controller, Get, Post, Query, Body, Res, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import { MetaLeadsBffService } from './meta-leads.bff.service'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

@Controller('api/public/meta')
export class PublicMetaLeadsBffController {
  constructor(private readonly service: MetaLeadsBffService) {}

  @Get('leadgen-webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode === 'subscribe' && verifyToken) return res.status(HttpStatus.OK).send(challenge)
    return res.status(HttpStatus.FORBIDDEN).send('Verification failed')
  }

  @Post('leadgen-webhook')
  async handleWebhookEvent(@Body() payload: unknown, @Res() res: Response): Promise<void> {
    res.status(HttpStatus.OK).json({ received: true })
    const entries = asArray(asRecord(payload).entry)
    for (const entryValue of entries) {
      const entry = asRecord(entryValue)
      for (const changeValue of asArray(entry.changes)) {
        const change = asRecord(changeValue)
        if (change.field !== 'leadgen') continue
        const value = asRecord(change.value)
        const leadgenId = typeof value.leadgen_id === 'string' ? value.leadgen_id : undefined
        if (!leadgenId) continue
        const formId = typeof value.form_id === 'string' ? value.form_id : 'General'
        const adId = typeof value.ad_id === 'string' ? value.ad_id : 'Feed'
        await this.service.simulateLead({
          formName: `Meta Form (${formId})`,
          campaignName: 'Campaña Facebook Lead Ads Activa',
          adName: `Anuncio FB (${adId})`,
          fullName: 'Prospecto Meta Lead Ads',
          email: `prospecto_${leadgenId.slice(-6)}@empresa.com`,
          phone: '+57 300 000 0000',
        })
      }
    }
  }
}