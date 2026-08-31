import { ProductPricingType } from '@crm/contracts'

export class CreateProductCommand {
  constructor(
    readonly tenantId: string,
    readonly sku: string,
    readonly name: string,
    readonly unitPrice: number,
    readonly description?: string,
    readonly currency?: string,
    readonly pricingType?: ProductPricingType,
    readonly taxRate?: number,
  ) {}
}

export class UpdateProductCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly name?: string,
    readonly unitPrice?: number,
    readonly description?: string | null,
    readonly currency?: string,
    readonly pricingType?: ProductPricingType,
    readonly taxRate?: number,
    readonly isActive?: boolean,
  ) {}
}

export class DeleteProductCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class RequestQuoteApprovalCommand {
  constructor(
    readonly tenantId: string,
    readonly quoteId: string,
    readonly requestedDiscountPercent: number,
    readonly requestedByUserId: string,
  ) {}
}

export class DecideQuoteApprovalCommand {
  constructor(
    readonly tenantId: string,
    readonly approvalId: string,
    readonly approverUserId: string,
    readonly status: 'APPROVED' | 'REJECTED',
    readonly rejectionReason?: string,
  ) {}
}

export class InitiateSignatureCommand {
  constructor(
    readonly tenantId: string,
    readonly documentId: string,
    readonly signerName: string,
    readonly signerEmail: string,
    readonly documentType?: 'QUOTE' | 'CONTRACT',
    readonly signerPhone?: string,
    readonly expiresInDays?: number,
  ) {}
}

export class VerifySignatureOtpCommand {
  constructor(readonly token: string, readonly otpCode: string) {}
}

export class SubmitSignatureCommand {
  constructor(
    readonly token: string,
    readonly signatureDataUrl: string,
    readonly signerIp?: string,
    readonly signerUserAgent?: string,
    readonly documentHashSha256?: string,
  ) {}
}
