import { NatsConsumerService } from './nats-consumer.service'
import { NatsService } from './nats.service'

describe('NatsConsumerService', () => {
  let service: NatsConsumerService
  let mockNatsService: jest.Mocked<Partial<NatsService>>

  beforeEach(() => {
    mockNatsService = {
      getConnection: jest.fn().mockReturnValue(null),
      getStringCodec: jest.fn().mockReturnValue({
        decode: jest.fn((data: any) =>
          Buffer.isBuffer(data) ? data.toString('utf8') : typeof data === 'string' ? data : JSON.stringify(data),
        ),
        encode: jest.fn((str: string) => Buffer.from(str)),
      } as any),
      publish: jest.fn(),
    }
    service = new NatsConsumerService(mockNatsService as NatsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should handle delayed subscription gracefully when NATS is offline', async () => {
    const handler = jest.fn()
    await expect(
      service.subscribe('crm.contacts.created', 'scoring-group', handler),
    ).resolves.not.toThrow()
    expect(handler).not.toHaveBeenCalled()
  })

  it('should register subscription and process incoming events when connection is active', async () => {
    const handler = jest.fn().mockResolvedValue(undefined)
    const mockMsg = {
      data: Buffer.from(
        JSON.stringify({
          eventId: 'evt-12345',
          eventType: 'contacts.created',
          payload: { contactId: 'cnt-1', tenantId: 'ten-1' },
        }),
      ),
      headers: { get: jest.fn() },
      subject: 'crm.contacts.created',
    }

    const mockSub = {
      unsubscribe: jest.fn(),
      [Symbol.asyncIterator]: async function* () {
        yield mockMsg
      },
    }

    mockNatsService.getConnection = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(mockSub),
    } as any)

    await service.subscribe('crm.contacts.created', 'scoring-group', handler)

    // Wait for the async loop to tick
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt-12345',
        eventType: 'contacts.created',
        payload: { contactId: 'cnt-1', tenantId: 'ten-1' },
      }),
    )
  })
})
