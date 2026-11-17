import { GetCustomer360Handler } from '../../application/queries/customer-360.handlers'
import { GetCustomer360Query } from '../../application/queries/customer-360.queries'
import { Customer360Repository } from '../../domain/repositories/customer-360.repository'
import { Customer360 } from '../../domain/entities/customer-360.entity'
import { NotFoundException } from '@nestjs/common'

describe('GetCustomer360Handler', () => {
  let repo: jest.Mocked<Customer360Repository>
  let handler: GetCustomer360Handler

  beforeEach(() => {
    repo = {
      getProfile: jest.fn(),
    }
    handler = new GetCustomer360Handler(repo)
  })

  it('should return customer 360 profile if found', async () => {
    const profile = new Customer360(
      'contact-1',
      'tenant-1',
      'Carlos',
      'Rodriguez',
      'carlos@example.com',
      '+573001234567',
      'CEO',
      'Acme Corp',
      'comp-1',
      {
        ltv: 12000,
        mrr: 1000,
        activePipelineValue: 5000,
        loyaltyPoints: 150,
        leadScore: 85,
        leadTemperature: 'HOT',
        openTicketsCount: 1,
        activeContractsCount: 1,
        totalDealsCount: 3,
      },
      [
        {
          id: 'note-1',
          type: 'NOTE',
          title: 'Initial contact',
          description: 'Great meeting',
          timestamp: new Date().toISOString(),
        },
      ],
    )

    repo.getProfile.mockResolvedValue(profile)

    const result = await handler.execute(new GetCustomer360Query('tenant-1', 'contact-1'))

    expect(result.contactId).toBe('contact-1')
    expect(result.metrics.leadTemperature).toBe('HOT')
    expect(result.timeline).toHaveLength(1)
  })

  it('should throw NotFoundException if profile does not exist', async () => {
    repo.getProfile.mockResolvedValue(null)

    await expect(handler.execute(new GetCustomer360Query('tenant-1', 'invalid'))).rejects.toThrow(
      NotFoundException,
    )
  })
})
