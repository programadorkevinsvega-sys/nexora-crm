import { PipelinesBffController } from './pipelines.bff.controller'
import { PipelinesBffService } from './pipelines.bff.service'
import { CreateDealSchema } from '@crm/contracts'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'

describe('PipelinesBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: PipelinesBffController
  let mockService: jest.Mocked<PipelinesBffService>

  beforeEach(() => {
    mockService = {
      listDeals: jest.fn().mockResolvedValue({
        data: [{ id: 'deal-1', name: 'Software Enterprise Deal', amount: 50000 }],
        nextCursor: null,
      }),
      createDeal: jest.fn().mockResolvedValue({
        id: 'deal-new', name: 'New Cloud Subscription', amount: 25000,
      }),
      getDeal: jest.fn().mockResolvedValue({ id: 'deal-1', name: 'Software Enterprise Deal' }),
      updateDeal: jest.fn(),
      moveDeal: jest.fn(),
      winDeal: jest.fn(),
      loseDeal: jest.fn(),
      deleteDeal: jest.fn(),
      listPipelines: jest.fn(),
      createPipeline: jest.fn(),
      getPipelineBoard: jest.fn(),
    } as unknown as jest.Mocked<PipelinesBffService>
    controller = new PipelinesBffController(mockService)
  })

  it('lists deals with parsed query parameters and authenticated user', async () => {
    const user: AuthenticatedUser = { tenantId: 'tenant-1', userId: 'user-1', sub: 'user-1', role: 'admin' }
    const result = await controller.listDeals({ limit: '15', status: 'OPEN' }, user)
    expect(result.data.length).toBe(1)
    expect(mockService.listDeals).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 15, status: 'OPEN', requestingUserId: 'user-1' }),
      'tenant-1',
    )
  })

  it('creates a deal using the validated API DTO', async () => {
    const dto = CreateDealSchema.parse({
      pipelineId: '00000000-0000-4000-8000-000000000001',
      stageId: '00000000-0000-4000-8000-000000000002',
      name: 'New Cloud Subscription',
      amount: 25000,
    })
    const result = await controller.createDeal(dto, 'tenant-1')
    expect(result.id).toBe('deal-new')
    expect(mockService.createDeal).toHaveBeenCalledWith(dto, 'tenant-1')
  })
})
