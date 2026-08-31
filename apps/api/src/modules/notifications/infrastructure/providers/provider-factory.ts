import { Injectable } from '@nestjs/common'
import { EmailProvider, PushProvider } from './interfaces'
import { ResendEmailProvider } from './resend.provider'
import { AwsSesEmailProvider } from './ses.provider'
import { FirebaseFcmPushProvider } from './fcm.provider'

@Injectable()
export class ProviderFactory {
  getEmailProvider(): EmailProvider {
    const provider = process.env.EMAIL_PROVIDER || 'RESEND'
    switch (provider) {
      case 'SES': return new AwsSesEmailProvider()
      case 'RESEND': return new ResendEmailProvider()
      default: return new ResendEmailProvider()
    }
  }

  getPushProvider(): PushProvider {
    return new FirebaseFcmPushProvider()
  }
}
