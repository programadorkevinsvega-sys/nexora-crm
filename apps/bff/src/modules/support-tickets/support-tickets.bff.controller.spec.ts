import { SupportTicketsBffController } from './support-tickets.bff.controller'

describe('SupportTicketsBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: SupportTicketsBffController
  let mockService: any

  beforeEach(() => {
    mockService = {
      list: jest.fn().mockResolvedValue({
        data: [{ id: 'ticket-1', subject: 'Login Failure', status: 'OPEN' }],
        nextCursor: null,
      }),
      create: jest.fn().mockResolvedValue({
        id: 'ticket-new',
        subject: 'Cannot export CSV',
      }),
      getById: jest.fn().mockResolvedValue({
        ticket: { id: 'ticket-1', subject: 'Login Failure' },
        replies: [],
      }),
    }

    controller = new SupportTicketsBffController(mockService)
  })

  it('should list support tickets with priority and status filters', async () => {
    const result = await controller.list(undefined, '10', 'OPEN', 'HIGH', undefined, undefined, 'tenant-1')

    expect(result.data.length).toBe(1)
    expect(mockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, status: 'OPEN', priority: 'HIGH' }),
      'tenant-1',
    )
  })

  it('should create support ticket and forward DTO to gRPC service', async () => {
    const dto = { subject: 'Cannot export CSV', description: 'Timeout error' } as any
    const result = await controller.create(dto, 'tenant-1')

    expect(result.id).toBe('ticket-new')
    expect(mockService.create).toHaveBeenCalledWith(dto, 'tenant-1')
  })
})
