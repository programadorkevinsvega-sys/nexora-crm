import { Customer360BffController } from './customer-360.bff.controller'
import { Customer360BffService } from './customer-360.bff.service'
import type { Customer360Profile } from '@crm/contracts'

describe('Customer360BffController', () => {
  let controller: Customer360BffController
  let mockService: jest.Mocked<Customer360BffService>

  beforeEach(() => {
    mockService = {
      getCustomer360: jest.fn(),
    } as unknown as jest.Mocked<Customer360BffService>

    controller = new Customer360BffController(mockService)
  })

  it('should call getCustomer360 when GET /api/contacts/:id/360 is called', async () => {
    const profile: Customer360Profile = {
      contactId: '00000000-0000-0000-0000-000000000001',
      tenantId: '00000000-0000-0000-0000-000000000001',
      firstName: 'Laura',
      metrics: {
        ltv: 5000,
        mrr: 400,
        activePipelineValue: 1200,
        loyaltyPoints: 50,
        leadScore: 70,
        leadTemperature: 'WARM',
        openTicketsCount: 0,
        activeContractsCount: 1,
        totalDealsCount: 2,
      },
      timeline: [],
    }
    mockService.getCustomer360.mockResolvedValue(profile)

    const res = await controller.getCustomer360(profile.contactId, profile.tenantId)

    expect(mockService.getCustomer360).toHaveBeenCalledWith(profile.contactId, profile.tenantId)
    expect(res.firstName).toBe('Laura')
  })
})
