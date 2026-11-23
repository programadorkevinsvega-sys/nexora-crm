import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiHeader } from '@nestjs/swagger'
import type { Response } from 'express'
import { Public } from '../../common/decorators/public.decorator'
import { CampaignsBffService } from './campaigns.bff.service'
import { MassEmailService } from './mass-email.service'

@ApiTags('Marketing: Envíos Masivos & Tracking (Mass Email)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/campaigns')
export class MassEmailBffController {
  constructor(
    private readonly service: CampaignsBffService,
    private readonly massEmailService: MassEmailService,
  ) {}

  @Post(':id/send-bulk')
  @ApiOperation({ summary: 'Enviar campaña de email masivo a lista de destinatarios' })
  @ApiParam({ name: 'id', description: 'UUID de la campaña' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['recipients', 'subject', 'htmlTemplate'],
      properties: {
        recipients: {
          type: 'array',
          items: { type: 'string' },
          example: ['cliente1@empresa.com', 'cliente2@empresa.com'],
        },
        subject: { type: 'string', example: '🚀 Oferta Especial Exclusiva de Nexora CRM' },
        htmlTemplate: { type: 'string', example: '<h1>Hola {{contact.firstName}}</h1><p>Aprovecha nuestro descuento especial.</p>' },
        creds: { type: 'object', example: { host: 'smtp.gmail.com', port: 587 } },
      },
    },
  })
  async sendBulk(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { creds: Record<string, unknown>; recipients: string[]; subject: string; htmlTemplate: string },
  ) {
    return this.massEmailService.sendBulk(dto.creds, dto.recipients, dto.subject, dto.htmlTemplate)
  }

  @Post('send-test')
  @ApiOperation({ summary: 'Enviar correo de prueba a una sola dirección' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['recipient', 'subject', 'html'],
      properties: {
        recipient: { type: 'string', example: 'admin@miempresa.com' },
        subject: { type: 'string', example: '[TEST] Prueba de Plantilla de Email' },
        html: { type: 'string', example: '<h1>Correo de Prueba</h1>' },
      },
    },
  })
  async sendTest(
    @Body() dto: { creds: Record<string, unknown>; recipient: string; subject: string; html: string },
  ) {
    return this.massEmailService.sendTest(dto.creds, dto.recipient, dto.subject, dto.html)
  }

  @Public()
  @Get('track/open')
  @ApiOperation({ summary: 'Pixel invisible (1x1 GIF) de rastreo de apertura de correo' })
  trackOpen(
    @Query('campaignId') campaignId: string,
    @Query('memberId') memberId: string,
    @Res() res: Response,
  ) {
    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    res.setHeader('Content-Type', 'image/gif')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.send(buffer)
  }

  @Public()
  @Get('unsubscribe')
  @ApiOperation({ summary: 'Enlace para que el destinatario cancele su suscripción' })
  async unsubscribe(
    @Query('campaignId') campaignId: string,
    @Query('memberId') memberId: string,
    @Query('tenantId') tenantId: string,
  ) {
    if (memberId && tenantId) {
      await this.service.updateMemberStatus(memberId, 'UNSUBSCRIBED', tenantId)
    }
    return { success: true, message: 'Unsubscribed successfully' }
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estadísticas de entrega, aperturas, clics y rebotes de la campaña' })
  @ApiParam({ name: 'id', description: 'UUID de la campaña' })
  async getStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.service.getCampaignStats(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
