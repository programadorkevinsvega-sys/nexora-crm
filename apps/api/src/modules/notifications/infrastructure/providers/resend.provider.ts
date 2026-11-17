import { EmailProvider, SendEmailOptions, SendResult } from './interfaces'

export class ResendEmailProvider implements EmailProvider {
  readonly name = 'RESEND'

  async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) return { success: false, provider: this.name, error: 'RESEND_API_KEY not set' }
      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)
      const result = await resend.emails.send({
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        text: options.isHtml ? '' : options.body,
        html: options.isHtml ? options.body : '',
      })
      return { success: true, provider: this.name, providerMessageId: (result as any)?.data?.id ?? undefined }
    } catch (error: any) {
      return { success: false, provider: this.name, error: error.message ?? String(error) }
    }
  }
}
