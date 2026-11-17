import { AiSdrConsumerService } from '../../infrastructure/ai-sdr-consumer.service'
import { QualifyLeadBantHandler } from '../../application/commands/qualify-bant.handler'
import { NatsConsumerService, type DomainEventHandler } from '../../../../common/nats/nats-consumer.service'
import { BantQualification } from '../../domain/entities/bant-qualification.entity'

describe('AiSdrConsumerService', () => {
  let service: AiSdrConsumerService
  let mockNatsConsumer: jest.Mocked<Partial<NatsConsumerService>>
  let mockQualifyBantHandler: jest.Mocked<Partial<QualifyLeadBantHandler>>
  const subscriptions: Record<string, DomainEventHandler> = {}

  beforeEach(() => {
    mockNatsConsumer = {
      subscribe: jest.fn().mockImplementation((subject, queueGroup, handler) => {
        subscriptions[subject] = handler
        return Promise.resolve()
      }),
    }
    mockQualifyBantHandler = {
      execute: jest.fn().mockResolvedValue(
        BantQualification.create({
          tenantId: 'tenant-100',
          contactId: 'cnt-sdr-1',
          budgetScore: 22,
          authorityScore: 25,
          needScore: 23,
          timelineScore: 24,
          summaryReason: 'SQL Lead',
          recommendedAction: 'Schedule Demo',
        }),
      ),
    }

    service = new AiSdrConsumerService(
      mockNatsConsumer as NatsConsumerService,
      mockQualifyBantHandler as QualifyLeadBantHandler,
    )
  })

  it('should subscribe to inbound lead events on module init', async () => {
    await service.onModuleInit()

    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.web_forms.submitted',
      'ai-sdr-qualification-engine',
      expect.any(Function),
    )
    expect(mockNatsConsumer.subscribe).toHaveBeenCalledWith(
      'crm.whatsapp.message_received',
      'ai-sdr-qualification-engine',
      expect.any(Function),
    )
  })

  it('should trigger BANT qualification when a WhatsApp message is received', async () => {
    await service.onModuleInit()

    const handler = subscriptions['crm.whatsapp.message_received']
    expect(handler).toBeDefined()

    await handler({
      eventId: 'evt-wa-1',
      eventType: 'whatsapp.message_received',
      payload: {
        contactId: 'cnt-sdr-1',
        tenantId: 'tenant-100',
        message: 'Hola, soy CEO de TechCorp, necesitamos cotización urgente para implementar esta semana',
        jobTitle: 'CEO',
      },
    })

    expect(mockQualifyBantHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-100',
        contactId: 'cnt-sdr-1',
        jobTitle: 'CEO',
      }),
    )
  })
})
