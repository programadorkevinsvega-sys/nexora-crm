import { PushProvider, SendPushOptions, SendResult } from './interfaces'

function toFcmData(data: SendPushOptions['data']): Record<string, string> | undefined {
  if (!data) return undefined
  return Object.fromEntries(Object.entries(data).flatMap(([key, value]): Array<[string, string]> => {
    if (value === null || value === undefined) return []
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return [[key, String(value)]]
    }
    const serialized = JSON.stringify(value)
    return serialized === undefined ? [] : [[key, serialized]]
  }))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export class FirebaseFcmPushProvider implements PushProvider {
  readonly name = 'FCM'

  async sendPush(options: SendPushOptions): Promise<SendResult> {
    try {
      const admin = await import('firebase-admin')
      if (admin.apps.length === 0) admin.initializeApp()
      const messageId = await admin.messaging().send({
        token: options.deviceToken,
        notification: { title: options.title, body: options.body },
        data: toFcmData(options.data),
      })
      return { success: true, provider: this.name, providerMessageId: messageId }
    } catch (error: unknown) {
      return { success: false, provider: this.name, error: errorMessage(error) }
    }
  }
}
