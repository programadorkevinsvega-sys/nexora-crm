import { Injectable } from '@nestjs/common'
import {
  CreateProductCommand,
  UpdateProductCommand,
  DeleteProductCommand,
  RequestQuoteApprovalCommand,
  DecideQuoteApprovalCommand,
  InitiateSignatureCommand,
  VerifySignatureOtpCommand,
  SubmitSignatureCommand,
} from './cpq.commands'
import {
  ProductRepository,
  QuoteApprovalRepository,
  ESignatureRepository,
} from '../../domain/repositories/cpq.repository'
import { Product } from '../../domain/entities/product.entity'
import { QuoteApproval } from '../../domain/entities/quote-approval.entity'
import { ESignature } from '../../domain/entities/e-signature.entity'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import {
  QuoteApprovalRequestedEvent,
  QuoteApprovedEvent,
  DocumentSignatureCompletedEvent,
} from '../../domain/events/cpq.events'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class CreateProductHandler {
  constructor(private readonly repo: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<{ id: string }> {
    const product = Product.create({
      tenantId: command.tenantId,
      sku: command.sku,
      name: command.name,
      unitPrice: command.unitPrice,
      description: command.description,
      currency: command.currency,
      pricingType: command.pricingType,
      taxRate: command.taxRate,
    })
    await this.repo.save(product)
    return { id: product.id }
  }
}

@Injectable()
export class UpdateProductHandler {
  constructor(private readonly repo: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    const product = await this.repo.findById(command.tenantId, command.id)
    if (!product) throw new NotFoundError('Product', command.id)

    const updated = product.updateDetails({
      name: command.name,
      description: command.description,
      unitPrice: command.unitPrice,
      currency: command.currency,
      pricingType: command.pricingType,
      taxRate: command.taxRate,
      isActive: command.isActive,
    })
    await this.repo.save(updated)
    return updated
  }
}

@Injectable()
export class DeleteProductHandler {
  constructor(private readonly repo: ProductRepository) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
  }
}

@Injectable()
export class RequestQuoteApprovalHandler {
  constructor(
    private readonly repo: QuoteApprovalRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RequestQuoteApprovalCommand): Promise<{ id: string }> {
    const approval = QuoteApproval.request({
      tenantId: command.tenantId,
      quoteId: command.quoteId,
      requestedDiscountPercent: command.requestedDiscountPercent,
      requestedByUserId: command.requestedByUserId,
    })
    await this.repo.save(approval)
    await this.outbox.publish(
      new QuoteApprovalRequestedEvent(
        approval.id,
        approval.quoteId,
        approval.requestedDiscountPercent,
        approval.requestedByUserId,
      ),
    )
    return { id: approval.id }
  }
}

@Injectable()
export class DecideQuoteApprovalHandler {
  constructor(
    private readonly repo: QuoteApprovalRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DecideQuoteApprovalCommand): Promise<QuoteApproval> {
    const approval = await this.repo.findById(command.tenantId, command.approvalId)
    if (!approval) throw new NotFoundError('QuoteApproval', command.approvalId)

    const updated =
      command.status === 'APPROVED'
        ? approval.approve(command.approverUserId)
        : approval.reject(command.approverUserId, command.rejectionReason ?? 'Discount rejected')

    await this.repo.save(updated)

    if (command.status === 'APPROVED') {
      await this.outbox.publish(
        new QuoteApprovedEvent(updated.id, updated.quoteId, command.approverUserId),
      )
    }

    return updated
  }
}

@Injectable()
export class InitiateSignatureHandler {
  constructor(private readonly repo: ESignatureRepository) {}

  async execute(command: InitiateSignatureCommand): Promise<ESignature> {
    const signature = ESignature.initiate({
      tenantId: command.tenantId,
      documentId: command.documentId,
      documentType: command.documentType,
      signerName: command.signerName,
      signerEmail: command.signerEmail,
      signerPhone: command.signerPhone,
      expiresInDays: command.expiresInDays,
    })
    await this.repo.save(signature)
    return signature
  }
}

@Injectable()
export class VerifySignatureOtpHandler {
  constructor(private readonly repo: ESignatureRepository) {}

  async execute(command: VerifySignatureOtpCommand): Promise<{ verified: boolean }> {
    const signature = await this.repo.findByToken(command.token)
    if (!signature) throw new NotFoundError('ESignature', command.token)

    const verifiedSig = signature.verifyOtp(command.otpCode)
    await this.repo.save(verifiedSig)
    return { verified: true }
  }
}

@Injectable()
export class SubmitSignatureHandler {
  constructor(
    private readonly repo: ESignatureRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: SubmitSignatureCommand): Promise<ESignature> {
    const signature = await this.repo.findByToken(command.token)
    if (!signature) throw new NotFoundError('ESignature', command.token)

    const signed = signature.sign({
      signatureDataUrl: command.signatureDataUrl,
      signerIp: command.signerIp,
      signerUserAgent: command.signerUserAgent,
      documentHashSha256: command.documentHashSha256,
    })
    await this.repo.save(signed)

    await this.outbox.publish(
      new DocumentSignatureCompletedEvent(
        signed.id,
        signed.documentId,
        signed.documentType,
        signed.signerEmail,
        signed.documentHashSha256,
      ),
    )

    return signed
  }
}
