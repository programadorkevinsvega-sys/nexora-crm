import { DrizzleProductRepository, DrizzleQuoteApprovalRepository, DrizzleESignatureRepository } from '../../infrastructure/drizzle-cpq.repository'
import { Product } from '../../domain/entities/product.entity'
import { QuoteApproval } from '../../domain/entities/quote-approval.entity'
import { ESignature } from '../../domain/entities/e-signature.entity'
import * as dbModule from '@crm/database'

describe('Drizzle CPQ & E-Signature Repositories - Integration Tests', () => {
  let productRepo: DrizzleProductRepository
  let approvalRepo: DrizzleQuoteApprovalRepository
  let sigRepo: DrizzleESignatureRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    productRepo = new DrizzleProductRepository()
    approvalRepo = new DrizzleQuoteApprovalRepository()
    sigRepo = new DrizzleESignatureRepository()
  })

  it('should save a product entity via insert', async () => {
    mockDb.limit.mockResolvedValueOnce([]) // findById not found

    const product = Product.create({
      tenantId: 'tenant-1',
      sku: 'SKU-TEST',
      name: 'Test Product',
      unitPrice: 199.99,
    })

    await productRepo.save(product)
    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })

  it('should save a quote approval entity via insert', async () => {
    mockDb.limit.mockResolvedValueOnce([]) // findById not found

    const approval = QuoteApproval.request({
      tenantId: 'tenant-1',
      quoteId: 'quote-1',
      requestedDiscountPercent: 15,
      requestedByUserId: 'user-1',
    })

    await approvalRepo.save(approval)
    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })

  it('should save an e-signature request via insert', async () => {
    mockDb.limit.mockResolvedValueOnce([]) // findById not found

    const sig = ESignature.initiate({
      tenantId: 'tenant-1',
      documentId: 'doc-1',
      signerName: 'Test Signer',
      signerEmail: 'signer@test.com',
    })

    await sigRepo.save(sig)
    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })
})
