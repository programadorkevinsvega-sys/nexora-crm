import { Controller, Get, Post, Query, Body, Res, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import { MetaLeadsBffService } from './meta-leads.bff.service'

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
    if (mode === 'subscribe' && verifyToken) {
      return res.status(HttpStatus.OK).send(challenge)
    }
    return res.status(HttpStatus.FORBIDDEN).send('Verification failed')
  }

  @Post('leadgen-webhook')
  async handleWebhookEvent(@Body() payload: Record<string, any>, @Res() res: Response) {
    // Acknowledge Meta immediately with 200 OK
    res.status(HttpStatus.OK).json({ received: true })

    const entries = payload?.entry || []
    for (const entry of entries) {
      const changes = entry?.changes || []
      for (const change of changes) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value?.leadgen_id
          const formId = change.value?.form_id
          const pageId = change.value?.page_id
          const adId = change.value?.ad_id
          if (leadgenId) {
            await this.service.simulateLead({
              formName: `Meta Form (${formId || 'General'})`,
              campaignName: 'Campaña Facebook Lead Ads Activa',
              adName: `Anuncio FB (${adId || 'Feed'})`,
              fullName: 'Prospecto Meta Lead Ads',
              email: `prospecto_${leadgenId.slice(-6)}@empresa.com`,
              phone: '+57 300 000 0000',
            })
          }
        }
      }
    }
  }
}
