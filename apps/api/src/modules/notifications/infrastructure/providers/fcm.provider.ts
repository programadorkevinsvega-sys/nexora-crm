import { PushProvider, SendPushOptions, SendResult } from './interfaces'

export class FirebaseFcmPushProvider implements PushProvider {
  readonly name = 'FCM'

  async sendPush(options: SendPushOptions): Promise<SendResult> {
    try {
      const admin = await import('firebase-admin')
      if (!(admin as any).apps.length) {
        (admin as any).initializeApp()
      }
      const result = await (admin as any).messaging().send({
        token: options.deviceToken,
        notification: { title: options.title, body: options.body },
        data: options.data,
      })
      return { success: true, provider: this.name, providerMessageId: result }
    } catch (error: any) {
      return { success: false, provider: this.name, error: error.message ?? String(error) }
    }
  }
}
