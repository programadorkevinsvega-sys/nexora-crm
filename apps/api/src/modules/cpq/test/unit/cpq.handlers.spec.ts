import {
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
  RequestQuoteApprovalHandler,
  DecideQuoteApprovalHandler,
  InitiateSignatureHandler,
  SubmitSignatureHandler,
} from '../../application/commands/cpq.handlers'
import {
  CreateProductCommand,
  UpdateProductCommand,
  DeleteProductCommand,
  RequestQuoteApprovalCommand,
  DecideQuoteApprovalCommand,
  InitiateSignatureCommand,
  SubmitSignatureCommand,
} from '../../application/commands/cpq.commands'
import { ProductRepository, QuoteApprovalRepository, ESignatureRepository } from '../../domain/repositories/cpq.repository'
import { Product } from '../../domain/entities/product.entity'
import { QuoteApproval } from '../../domain/entities/quote-approval.entity'
import { ESignature } from '../../domain/entities/e-signature.entity'
import { OutboxService } from '../../../../common/outbox/outbox.service'

describe('CPQ and E-Signature Handlers', () => {
  let productRepo: jest.Mocked<ProductRepository>
  let approvalRepo: jest.Mocked<QuoteApprovalRepository>
  let signatureRepo: jest.Mocked<ESignatureRepository>
  let outbox: jest.Mocked<OutboxService>

  beforeEach(() => {
    productRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findBySku: jest.fn(),
      list: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    }

    approvalRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByQuoteId: jest.fn(),
      listPending: jest.fn(),
    }

    signatureRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByToken: jest.fn(),
      findByDocumentId: jest.fn(),
    }

    outbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as any
  })

  it('CreateProductHandler should save product', async () => {
    const handler = new CreateProductHandler(productRepo)
    const result = await handler.execute(
      new CreateProductCommand('tenant-1', 'SKU-01', 'Pro Plan', 499),
    )

    expect(result.id).toBeDefined()
    expect(productRepo.save).toHaveBeenCalledTimes(1)
  })

  it('UpdateProductHandler should update existing product', async () => {
    const existing = Product.create({
      tenantId: 'tenant-1',
      sku: 'SKU-01',
      name: 'Pro Plan',
      unitPrice: 499,
    })
    productRepo.findById.mockResolvedValue(existing)

    const handler = new UpdateProductHandler(productRepo)
    const updated = await handler.execute(
      new UpdateProductCommand('tenant-1', existing.id, 'Pro Plan Updated', 599),
    )

    expect(updated.name).toBe('Pro Plan Updated')
    expect(updated.unitPrice).toBe(599)
    expect(productRepo.save).toHaveBeenCalledTimes(1)
  })

  it('DeleteProductHandler should call delete on repository', async () => {
    productRepo.delete = jest.fn().mockResolvedValue(undefined)
    const handler = new DeleteProductHandler(productRepo)
    await handler.execute(new DeleteProductCommand('tenant-1', 'prod-123'))

    expect(productRepo.delete).toHaveBeenCalledWith('tenant-1', 'prod-123')
  })

  it('RequestQuoteApprovalHandler should create approval and publish event to outbox', async () => {
    const handler = new RequestQuoteApprovalHandler(approvalRepo, outbox)
    const result = await handler.execute(
      new RequestQuoteApprovalCommand('tenant-1', 'quote-100', 25, 'sales-user-1'),
    )

    expect(result.id).toBeDefined()
    expect(approvalRepo.save).toHaveBeenCalledTimes(1)
    expect(outbox.publish).toHaveBeenCalledTimes(1)
  })

  it('DecideQuoteApprovalHandler should approve and publish event to outbox', async () => {
    const approval = QuoteApproval.request({
      tenantId: 'tenant-1',
      quoteId: 'quote-100',
      requestedDiscountPercent: 25,
      requestedByUserId: 'sales-user-1',
    })
    approvalRepo.findById.mockResolvedValue(approval)

    const handler = new DecideQuoteApprovalHandler(approvalRepo, outbox)
    const result = await handler.execute(
      new DecideQuoteApprovalCommand('tenant-1', approval.id, 'manager-1', 'APPROVED'),
    )

    expect(result.status).toBe('APPROVED')
    expect(approvalRepo.save).toHaveBeenCalledTimes(1)
    expect(outbox.publish).toHaveBeenCalledTimes(1)
  })

  it('SubmitSignatureHandler should record signature and publish crm.contract.signed', async () => {
    const sig = ESignature.initiate({
      tenantId: 'tenant-1',
      documentId: 'quote-100',
      signerName: 'Jane Client',
      signerEmail: 'jane@client.com',
    })
    signatureRepo.findByToken.mockResolvedValue(sig)

    const handler = new SubmitSignatureHandler(signatureRepo, outbox)
    const signed = await handler.execute(
      new SubmitSignatureCommand(sig.token, 'data:image/svg+xml;base64,...', '127.0.0.1'),
    )

    expect(signed.status).toBe('SIGNED')
    expect(signatureRepo.save).toHaveBeenCalledTimes(1)
    expect(outbox.publish).toHaveBeenCalledTimes(1)
  })
})
