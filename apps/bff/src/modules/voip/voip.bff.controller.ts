import { Controller, Post, Body, Headers, Res, Logger } from '@nestjs/common'
import { Response } from 'express'
import { VoipBffService } from './voip.bff.service'

@Controller('api/voip')
export class VoipBffController {
  private readonly logger = new Logger(VoipBffController.name)

  constructor(private readonly voipService: VoipBffService) {}

  @Post('token')
  async generateToken(
    @Body() body: { identity?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    const identity = body.identity || `agent_${Date.now()}`
    return this.voipService.generateToken(identity, tenantId)
  }

  @Post('voice')
  async handleVoiceWebhook(
    @Body() body: Record<string, any>,
    @Res() res: Response,
  ) {
    const to = body.To || body.to || ''
    const callerId = body.CallerId || body.From || ''
    this.logger.log(`TwiML requested for outgoing call to: ${to}`)

    const twiml = this.voipService.generateTwiML(to, callerId)
    res.type('text/xml').send(twiml)
  }

  @Post('recording')
  async handleRecordingWebhook(
    @Body() body: Record<string, any>,
    @Res() res: Response,
  ) {
    const callSid = body.CallSid || body.callSid || 'unknown_call'
    const from = body.From || body.from || ''
    const to = body.To || body.to || ''
    const recordingUrl = body.RecordingUrl || body.recordingUrl || ''
    const duration = parseInt(body.RecordingDuration || body.recordingDuration || '0', 10)

    this.logger.log(`VoIP recording received for call ${callSid}: ${recordingUrl} (${duration}s)`)

    await this.voipService.recordCallCompleted({
      callSid,
      from,
      to,
      durationSecs: duration,
      recordingUrl,
    })

    res.status(200).json({ received: true })
  }
}
