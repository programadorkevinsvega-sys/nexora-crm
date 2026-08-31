import { PipelinesBffController } from './pipelines.bff.controller'

describe('PipelinesBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: PipelinesBffController
  let mockService: any

  beforeEach(() => {
    mockService = {
      listDeals: jest.fn().mockResolvedValue({
        data: [{ id: 'deal-1', name: 'Software Enterprise Deal', amount: 50000 }],
        nextCursor: null,
      }),
      createDeal: jest.fn().mockResolvedValue({
        id: 'deal-new',
        name: 'New Cloud Subscription',
        amount: 25000,
      }),
      getDeal: jest.fn().mockResolvedValue({
        id: 'deal-1',
        name: 'Software Enterprise Deal',
      }),
    }

    controller = new PipelinesBffController(mockService)
  })

  it('should list deals with parsed query parameters', async () => {
    const result = await controller.listDeals({ limit: '15', status: 'OPEN' }, 'tenant-1')

    expect(result.data.length).toBe(1)
    expect(mockService.listDeals).toHaveBeenCalled()
  })

  it('should create deal and forward DTO to gRPC service', async () => {
    const dto = { pipelineId: 'pipe-1', stageId: 'stage-1', name: 'New Cloud Subscription', amount: 25000 } as any
    const result = await controller.createDeal(dto, 'tenant-1')

    expect(result.id).toBe('deal-new')
    expect(mockService.createDeal).toHaveBeenCalledWith(dto, 'tenant-1')
  })
})
