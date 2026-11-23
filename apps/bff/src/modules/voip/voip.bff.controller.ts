import { Controller, Post, Body, Headers, Res, Logger } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiHeader } from '@nestjs/swagger'
import type { Response } from 'express'
import { VoipBffService } from './voip.bff.service'

interface TwilioWebhookBody {
  To?: string; to?: string; CallerId?: string; From?: string
  CallSid?: string; callSid?: string
  RecordingUrl?: string; recordingUrl?: string
  RecordingDuration?: string | number; recordingDuration?: string | number
}

@ApiTags('Telefonía VoIP Click-to-Call (VoIP)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/voip')
export class VoipBffController {
  private readonly logger = new Logger(VoipBffController.name)
  constructor(private readonly voipService: VoipBffService) {}

  @Post('token')
  @ApiOperation({ summary: 'Generar token Twilio Voice SDK para llamar desde el navegador' })
  @ApiBody({ schema: { type: 'object', properties: { identity: { type: 'string', example: 'agente_ventas_01' } } } })
  async generateToken(@Body() body: { identity?: string }, @Headers('X-Tenant-Id') tenantId?: string) {
    const identity = body.identity || `agent_${Date.now()}`
    return this.voipService.generateToken(identity, tenantId)
  }

  @Post('voice')
  @ApiOperation({ summary: 'Webhook TwiML para conectar llamada saliente' })
  async handleVoiceWebhook(@Body() body: TwilioWebhookBody, @Res() res: Response): Promise<void> {
    const to = body.To || body.to || ''
    const callerId = body.CallerId || body.From || ''
    this.logger.log(`TwiML requested for outgoing call to: ${to}`)
    const twiml = this.voipService.generateTwiML(to, callerId)
    res.type('text/xml').send(twiml)
  }

  @Post('recording')
  @ApiOperation({ summary: 'Webhook de Twilio para guardar grabación y duración de llamada' })
  async handleRecordingWebhook(@Body() body: TwilioWebhookBody, @Res() res: Response): Promise<void> {
    const callSid = body.CallSid || body.callSid || 'unknown_call'
    const from = body.From || body.from || ''
    const to = body.To || body.to || ''
    const recordingUrl = body.RecordingUrl || body.recordingUrl || ''
    const duration = Number.parseInt(String(body.RecordingDuration ?? body.recordingDuration ?? '0'), 10)
    this.logger.log(`VoIP recording received for call ${callSid}: ${recordingUrl} (${duration}s)`)
    await this.voipService.recordCallCompleted({ callSid, from, to, durationSecs: duration, recordingUrl })
    res.status(200).json({ received: true })
  }
}