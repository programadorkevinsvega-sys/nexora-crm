import { SupportTicketsBffController } from './support-tickets.bff.controller'
import { SupportTicketsBffService } from './support-tickets.bff.service'
import { CreateTicketSchema } from '@crm/contracts'

describe('SupportTicketsBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: SupportTicketsBffController
  let mockService: jest.Mocked<SupportTicketsBffService>

  beforeEach(() => {
    mockService = {
      list: jest.fn().mockResolvedValue({
        data: [{ id: 'ticket-1', subject: 'Login Failure', status: 'OPEN' }],
        nextCursor: null,
      }),
      create: jest.fn().mockResolvedValue({ id: 'ticket-new', subject: 'Cannot export CSV' }),
      getById: jest.fn().mockResolvedValue({ id: 'ticket-1', subject: 'Login Failure' }),
      updateStatus: jest.fn(),
      assign: jest.fn(),
      addReply: jest.fn(),
      listReplies: jest.fn(),
    } as unknown as jest.Mocked<SupportTicketsBffService>
    controller = new SupportTicketsBffController(mockService)
  })

  it('lists tickets with priority and status filters', async () => {
    const result = await controller.list(undefined, '10', 'OPEN', 'HIGH', undefined, undefined, 'tenant-1')
    expect(result.data.length).toBe(1)
    expect(mockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, status: 'OPEN', priority: 'HIGH' }),
      'tenant-1',
    )
  })

  it('creates a support ticket using the validated DTO', async () => {
    const dto = CreateTicketSchema.parse({
      subject: 'Cannot export CSV',
      description: 'Timeout error',
      contactId: '00000000-0000-4000-8000-000000000001',
    })
    const result = await controller.create(dto, 'tenant-1')
    expect(result.id).toBe('ticket-new')
    expect(mockService.create).toHaveBeenCalledWith(dto, 'tenant-1')
  })
})
