import { CompaniesBffController } from './companies.bff.controller'
import { CompaniesBffService } from './companies.bff.service'
import { CreateCompanySchema } from '@crm/contracts'

describe('CompaniesBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: CompaniesBffController
  let mockService: jest.Mocked<CompaniesBffService>

  beforeEach(() => {
    mockService = {
      list: jest.fn().mockResolvedValue({
        data: [{ id: 'comp-1', name: 'Stark Industries', industry: 'Tech' }], nextCursor: null,
      }),
      create: jest.fn().mockResolvedValue({ id: 'comp-new', name: 'Wayne Enterprises' }),
      getById: jest.fn().mockResolvedValue({ id: 'comp-1', name: 'Stark Industries' }),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<CompaniesBffService>
    controller = new CompaniesBffController(mockService)
  })

  it('lists companies with industry and query filters', async () => {
    const result = await controller.list(undefined, '10', 'Stark', 'Tech', 'tenant-1')
    expect(result.data.length).toBe(1)
    expect(mockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, search: 'Stark', industry: 'Tech' }),
      'tenant-1',
    )
  })

  it('creates company and forwards parsed DTO to service', async () => {
    const dto = CreateCompanySchema.parse({ name: 'Wayne Enterprises' })
    const result = await controller.create(dto, 'tenant-1')
    expect(result.id).toBe('comp-new')
    expect(mockService.create).toHaveBeenCalledWith(dto, 'tenant-1')
  })
})