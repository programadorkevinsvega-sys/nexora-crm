import {
  SendTransientEmailCommand,
  SendTransientEmailHandler,
} from '../../application/send-transient-email.handler'

describe('SendTransientEmailHandler', () => {
  const tenantId = '00000000-0000-4000-8000-000000000001'
  const recipient = 'invitee@example.com'
  const subject = 'Accept your invitation'
  const secretUrl = 'https://crm.example.com/accept-invitation#token=one-time-secret-value'

  let repository: {
    saveNotification: jest.Mock
    saveLog: jest.Mock
  }
  let outbox: { publish: jest.Mock }
  let provider: { send: jest.Mock }
  let factory: { getEmailProvider: jest.Mock }
  let handler: SendTransientEmailHandler

  beforeEach(() => {
    repository = {
      saveNotification: jest.fn().mockResolvedValue(undefined),
      saveLog: jest.fn().mockResolvedValue(undefined),
    }
    outbox = { publish: jest.fn().mockResolvedValue(undefined) }
    provider = {
      send: jest.fn().mockResolvedValue({
        success: true,
        provider: 'RESEND',
        providerMessageId: 'message-123',
      }),
    }
    factory = { getEmailProvider: jest.fn().mockReturnValue(provider) }
    handler = new SendTransientEmailHandler(
      repository as any,
      outbox as any,
      factory as any,
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
