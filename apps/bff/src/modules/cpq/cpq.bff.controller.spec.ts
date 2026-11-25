import { CpqBffController } from './cpq.bff.controller'
import { CpqBffService } from './cpq.bff.service'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'

describe('CpqBffController - REST Gateway Tests', () => {
  let controller: CpqBffController
  let mockService: jest.Mocked<CpqBffService>

  beforeEach(() => {
    mockService = {
      createProduct: jest.fn().mockResolvedValue({
        id: 'prod-1',
        sku: 'SKU-01',
        name: 'Pro License',
        unitPrice: 500,
      }),
      listProducts: jest.fn().mockResolvedValue([
        { id: 'prod-1', sku: 'SKU-01', name: 'Pro License', unitPrice: 500 },
      ]),
      getProduct: jest.fn().mockResolvedValue({
        id: 'prod-1',
        sku: 'SKU-01',
        name: 'Pro License',
        unitPrice: 500,
      }),
      requestQuoteApproval: jest.fn().mockResolvedValue({ id: 'appr-1', status: 'PENDING' }),
      decideQuoteApproval: jest.fn().mockResolvedValue({ id: 'appr-1', status: 'APPROVED' }),
      listPendingApprovals: jest.fn().mockResolvedValue([
        { id: 'appr-1', status: 'PENDING', requestedDiscountPercent: 25 },
      ]),
      initiateSignature: jest.fn().mockResolvedValue({
        id: 'sig-1',
        token: 'token-abc',
        status: 'PENDING',
      }),
      verifySignatureOtp: jest.fn().mockResolvedValue(undefined),
      submitSignature: jest.fn().mockResolvedValue({
        id: 'sig-1',
        token: 'token-abc',
        status: 'SIGNED',
      }),
      getSignatureByToken: jest.fn().mockResolvedValue({
        id: 'sig-1',
        token: 'token-abc',
        status: 'PENDING',
      }),
    } as unknown as jest.Mocked<CpqBffService>

    controller = new CpqBffController(mockService)
  })

  it('should call createProduct when POST /api/cpq/products is called', async () => {
    const payload = {
      sku: 'SKU-01',
      name: 'Pro License',
      unitPrice: 500,
    }
    const result = await controller.createProduct(payload, 'tenant-1')

    expect(mockService.createProduct).toHaveBeenCalledWith(payload, 'tenant-1')
    expect(result.id).toBe('prod-1')
  })

  it('should call updateProduct when PUT /api/cpq/products/:id is called', async () => {
    mockService.updateProduct = jest.fn().mockResolvedValue({ id: 'prod-1', name: 'Updated' })
    const payload = { name: 'Updated' }
    const result = await controller.updateProduct('00000000-0000-0000-0000-000000000001', payload, 'tenant-1')

    expect(mockService.updateProduct).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001', payload, 'tenant-1')
    expect(result.name).toBe('Updated')
  })

  it('should call deleteProduct when DELETE /api/cpq/products/:id is called', async () => {
    mockService.deleteProduct = jest.fn().mockResolvedValue(undefined)
    const result = await controller.deleteProduct('00000000-0000-0000-0000-000000000001', 'tenant-1')

    expect(mockService.deleteProduct).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001', 'tenant-1')
    expect(result.success).toBe(true)
  })

  it('should call requestQuoteApproval when POST /api/cpq/approvals/request is called', async () => {
    const payload = {
      quoteId: '00000000-0000-0000-0000-000000000001',
      requestedDiscountPercent: 25,
    }
    const user: AuthenticatedUser = { tenantId: 'tenant-1', userId: 'user-1', sub: 'user-1', role: 'admin' }
    const result = await controller.requestApproval(payload, user)

    expect(mockService.requestQuoteApproval).toHaveBeenCalledWith(payload, 'user-1', 'tenant-1')
    expect(result.id).toBe('appr-1')
  })

  it('should call getSignatureByToken when GET /api/cpq/signatures/:token is called', async () => {
    const result = await controller.getSignatureByToken('token-abc')

    expect(mockService.getSignatureByToken).toHaveBeenCalledWith('token-abc')
    expect(result.token).toBe('token-abc')
  })

  it('should call createProductTemplate when POST /api/cpq/templates is called', async () => {
    mockService.createProductTemplate = jest.fn().mockResolvedValue({ id: 'tmpl-1', name: 'Starter' })
    const payload = { name: 'Starter', defaultUnitPrice: 99 }
    const result = await controller.createProductTemplate(payload, 'tenant-1')

    expect(mockService.createProductTemplate).toHaveBeenCalledWith(payload, 'tenant-1')
    expect(result.id).toBe('tmpl-1')
  })

  it('should call listProductTemplates when GET /api/cpq/templates is called', async () => {
    mockService.listProductTemplates = jest.fn().mockResolvedValue([{ id: 'tmpl-1', name: 'Starter' }])
    const result = await controller.listProductTemplates('tenant-1')

    expect(mockService.listProductTemplates).toHaveBeenCalledWith('tenant-1')
    expect(result).toHaveLength(1)
  })

  it('should call deleteProductTemplate when DELETE /api/cpq/templates/:id is called', async () => {
    mockService.deleteProductTemplate = jest.fn().mockResolvedValue(undefined)
    const result = await controller.deleteProductTemplate('00000000-0000-0000-0000-000000000001', 'tenant-1')

    expect(mockService.deleteProductTemplate).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001', 'tenant-1')
    expect(result.success).toBe(true)
  })
})
