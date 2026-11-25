import {
  SendTransientEmailCommand,
  SendTransientEmailHandler,
} from '../../application/send-transient-email.handler'
import { NotificationsRepository } from '../../domain/repositories/notifications.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { ProviderFactory } from '../../infrastructure/providers/provider-factory'
import { EmailProvider } from '../../infrastructure/providers/interfaces'

describe('SendTransientEmailHandler', () => {
  const tenantId = '00000000-0000-4000-8000-000000000001'
  const recipient = 'invitee@example.com'
  const subject = 'Accept your invitation'
  const secretUrl = 'https://crm.example.com/accept-invitation#token=one-time-secret-value'

  let repository: jest.Mocked<Pick<NotificationsRepository, 'saveNotification' | 'saveLog'>>
  let outbox: jest.Mocked<Pick<OutboxService, 'publish'>>
  let provider: jest.Mocked<EmailProvider>
  let factory: jest.Mocked<Pick<ProviderFactory, 'getEmailProvider'>>
  let handler: SendTransientEmailHandler

  beforeEach(() => {
    repository = {
      saveNotification: jest.fn<ReturnType<NotificationsRepository['saveNotification']>, Parameters<NotificationsRepository['saveNotification']>>().mockResolvedValue(undefined),
      saveLog: jest.fn<ReturnType<NotificationsRepository['saveLog']>, Parameters<NotificationsRepository['saveLog']>>().mockResolvedValue(undefined),
    }
    outbox = { publish: jest.fn<ReturnType<OutboxService['publish']>, Parameters<OutboxService['publish']>>().mockResolvedValue(undefined) }
    provider = {
      send: jest.fn<ReturnType<EmailProvider['send']>, Parameters<EmailProvider['send']>>().mockResolvedValue({
        success: true,
        provider: 'RESEND',
        providerMessageId: 'message-123',
      }),
    }
    factory = { getEmailProvider: jest.fn<EmailProvider, []>().mockReturnValue(provider) }
    handler = new SendTransientEmailHandler(
      repository as unknown as NotificationsRepository,
      outbox as unknown as OutboxService,
      factory as unknown as ProviderFactory,
    )
  })

  it('sends the actual email but persists only a redacted body and metadata', async () => {
    const result = await handler.execute(new SendTransientEmailCommand(
      tenantId, recipient, subject, secretUrl,
    ))

    expect(provider.send).toHaveBeenCalledWith(expect.objectContaining({
      to: recipient,
      subject,
      body: secretUrl,
    }))
    expect(repository.saveNotification).toHaveBeenCalledTimes(2)
    expect(repository.saveNotification.mock.calls[0][0].body).toBe('[contenido transitorio omitido]')
    expect(repository.saveNotification.mock.calls[1][0].body).toBe('[contenido transitorio omitido]')
    expect(repository.saveLog).toHaveBeenCalledTimes(1)
    expect(repository.saveLog.mock.calls[0][0].bodyPreview).toBe('[contenido transitorio omitido]')
    expect(result.body).toBe('[contenido transitorio omitido]')

    for (const [event] of outbox.publish.mock.calls) {
      expect(JSON.stringify(event.toPrimitives())).not.toContain('one-time-secret-value')
    }
  })

  it('redacts provider errors that could echo the secret email body', async () => {
    provider.send.mockResolvedValue({
      success: false,
      provider: 'RESEND',
      error: 'Request rejected for URL ' + secretUrl,
    })

    const result = await handler.execute(new SendTransientEmailCommand(
      tenantId, recipient, subject, secretUrl,
    ))

    const safeError = 'Email provider rejected the transient message'
    expect(result.status).toBe('FAILED')
    expect(result.lastError).toBe(safeError)
    expect(repository.saveLog.mock.calls[0][0].errorMessage).toBe(safeError)
    expect(outbox.publish.mock.calls.map(([event]) => JSON.stringify(event.toPrimitives())).join(' '))
      .not.toContain('one-time-secret-value')
  })
})
