export interface SendEmailOptions {
  from: string
  to: string | string[]
  subject: string
  body: string
  isHtml?: boolean
}

export interface SendPushOptions {
  deviceToken: string
  title: string
  body: string
  data?: Record<string, unknown>
}

export interface SendResult {
  success: boolean
  provider: string
  providerMessageId?: string
  error?: string
}

export interface EmailProvider {
  readonly name: string
  send(options: SendEmailOptions): Promise<SendResult>
}

export interface PushProvider {
  readonly name: string
  sendPush(options: SendPushOptions): Promise<SendResult>
}
