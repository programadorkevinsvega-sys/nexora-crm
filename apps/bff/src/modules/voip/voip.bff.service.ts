import { Injectable, Logger } from '@nestjs/common'
import * as twilioLib from 'twilio'
import { IntegrationsBffService } from '../integrations/integrations.bff.service'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'

const AccessToken = twilioLib.jwt.AccessToken
const VoiceGrant = AccessToken.VoiceGrant
const VoiceResponse = twilioLib.twiml.VoiceResponse

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001'
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000002'

@Injectable()
export class VoipBffService {
  private readonly logger = new Logger(VoipBffService.name)
  constructor(
    private readonly integrationsService: IntegrationsBffService,
    private readonly api: ApiCoreGrpcClient,
  ) {}

  async getTwilioConfig(tenantId: string = DEFAULT_TENANT) {
    const creds = await this.integrationsService.getDecryptedConfig(tenantId, 'TWILIO_SMS')
    const accountSid = creds?.accountSid || process.env.TWILIO_ACCOUNT_SID || 'AC_MOCK_ACCOUNT_SID'
    const authToken = creds?.authToken || process.env.TWILIO_AUTH_TOKEN || 'mock_auth_token'
    const apiKey = creds?.apiKey || process.env.TWILIO_API_KEY || accountSid
    const apiSecret = creds?.apiSecret || process.env.TWILIO_API_SECRET || authToken
    const twimlAppSid = creds?.twimlAppSid || process.env.TWILIO_TWIML_APP_SID || 'AP_MOCK_APP_SID'
    const fromNumber = creds?.fromNumber || process.env.TWILIO_FROM_NUMBER || '+18005550199'
    return { accountSid, authToken, apiKey, apiSecret, twimlAppSid, fromNumber }
  }

  async generateToken(identity: string, tenantId: string = DEFAULT_TENANT): Promise<{ token: string; identity: string }> {
    const config = await this.getTwilioConfig(tenantId)
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: config.twimlAppSid,
      incomingAllow: true,
    })
    const token = new AccessToken(config.accountSid, config.apiKey, config.apiSecret, { identity, ttl: 3600 })
    token.addGrant(voiceGrant)
    this.logger.log(`VoIP WebRTC Token generated for identity: ${identity}`)
    return { token: token.toJwt(), identity }
  }

  generateTwiML(to: string, callerId?: string): string {
    const response = new VoiceResponse()
    if (to) {
      const dial = response.dial({
        callerId: callerId || process.env.TWILIO_FROM_NUMBER || '+18005550199',
        record: 'record-from-answer-dual',
        recordingStatusCallback: '/api/voip/recording',
      })
      dial.number(to)
    } else {
      response.say({ language: 'es-MX' }, 'Gracias por llamar a Nexora CRM. Conectando con un agente.')
    }
    return response.toString()
  }

  async recordCallCompleted(params: {
    callSid: string
    from: string
    to: string
    durationSecs?: number
    recordingUrl?: string
    tenantId?: string
  }): Promise<void> {
    const tenantId = params.tenantId || DEFAULT_TENANT
    const duration = params.durationSecs || 0
    const cleanTo = params.to ? params.to.replace(/\D/g, '') : ''
    const phoneTail = cleanTo.slice(-8)
    let contactId: string | null = null
    if (phoneTail) {
      const contactsRes = await this.api.listContacts({ tenantId, search: phoneTail, limit: 1 })
      if (contactsRes.data.length > 0) contactId = contactsRes.data[0].id
    }

    const summary = params.recordingUrl
      ? `Llamada VoIP saliente (${duration}s). 🎙️ Grabación: ${params.recordingUrl}`
      : `Llamada VoIP saliente (${duration}s) vía WebRTC Navegador.`
    await this.api.createCall({
      tenantId, contactId: contactId || undefined, callType: 'OUTBOUND',
      durationSeconds: duration, summary, happenedAt: new Date().toISOString(),
      authorUserId: DEFAULT_USER_ID,
    })
    this.logger.log(`VoIP Call logged: SID=${params.callSid} Contact=${contactId || 'unknown'} Duration=${duration}s`)
  }
}