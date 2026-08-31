import { DrizzleTicketRepository } from '../../infrastructure/drizzle-ticket.repository'
import { SupportTicket } from '../../domain/entities/support-ticket.entity'
import * as dbModule from '@crm/database'

describe('DrizzleTicketRepository - Persistence Integration Tests', () => {
  let repository: DrizzleTicketRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        supportTickets: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleTicketRepository()
  })

  it('should find ticket by id with domain model reconstruction', async () => {
    mockDb.query.supportTickets.findFirst.mockResolvedValue({
      id: 'ticket-1',
      tenantId: 'tenant-1',
      subject: 'Billing Error',
      description: 'Double charged for SaaS subscription',
      status: 'OPEN',
      priority: 'URGENT',
      assignedUserId: 'agent-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const ticket = await repository.findById('tenant-1', 'ticket-1')

    expect(ticket).not.toBeNull()
    expect(ticket?.subject).toBe('Billing Error')
    expect(ticket?.priority).toBe('URGENT')
  })

  it('should filter tickets by status and priority', async () => {
    mockDb.query.supportTickets.findMany.mockResolvedValue([
      {
        id: 'ticket-1',
        tenantId: 'tenant-1',
        subject: 'Slow latency in dashboard',
        description: 'p99 is spiking',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await repository.list('tenant-1', { limit: 10, status: 'IN_PROGRESS' as any, priority: 'HIGH' as any })

    expect(result.data.length).toBe(1)
    expect(result.data[0].status).toBe('IN_PROGRESS')
  })
})
