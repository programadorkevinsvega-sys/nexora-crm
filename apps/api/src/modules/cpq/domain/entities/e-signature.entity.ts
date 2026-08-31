import { SignatureStatus } from '@crm/contracts'

export class ESignature {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly documentId: string,
    readonly documentType: 'QUOTE' | 'CONTRACT',
    readonly signerName: string,
    readonly signerEmail: string,
    readonly signerPhone: string | null,
    readonly token: string,
    readonly otpCode: string | null,
    readonly status: SignatureStatus,
    readonly signerIp: string | null,
    readonly signerUserAgent: string | null,
    readonly documentHashSha256: string | null,
    readonly signatureDataUrl: string | null,
    readonly signedAt: Date | null,
    readonly expiresAt: Date,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static initiate(props: {
    tenantId: string
    documentId: string
    documentType?: 'QUOTE' | 'CONTRACT'
    signerName: string
    signerEmail: string
    signerPhone?: string | null
    expiresInDays?: number
  }): ESignature {
    const token = crypto.randomUUID().replace(/-/g, '')
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (props.expiresInDays ?? 7))

    return new ESignature(
      crypto.randomUUID(),
      props.tenantId,
      props.documentId,
      props.documentType ?? 'QUOTE',
      props.signerName.trim(),
      props.signerEmail.trim().toLowerCase(),
      props.signerPhone ?? null,
      token,
      otpCode,
      'PENDING',
      null,
      null,
      null,
      null,
      null,
      expiresAt,
      new Date(),
      new Date(),
    )
  }

  verifyOtp(enteredCode: string): ESignature {
    if (this.status !== 'PENDING') {
      throw new Error(`Cannot verify OTP for document in ${this.status} status`)
    }
    if (new Date() > this.expiresAt) {
      throw new Error('Signature request has expired')
    }
    if (this.otpCode !== enteredCode) {
      throw new Error('Invalid OTP code')
    }

    return new ESignature(
      this.id,
      this.tenantId,
      this.documentId,
      this.documentType,
      this.signerName,
      this.signerEmail,
      this.signerPhone,
      this.token,
      this.otpCode,
      'OTP_VERIFIED',
      this.signerIp,
      this.signerUserAgent,
      this.documentHashSha256,
      this.signatureDataUrl,
      this.signedAt,
      this.expiresAt,
      this.createdAt,
      new Date(),
    )
  }

  sign(props: {
    signatureDataUrl: string
    signerIp?: string | null
    signerUserAgent?: string | null
    documentHashSha256?: string | null
  }): ESignature {
    if (this.status === 'SIGNED') {
      throw new Error('Document is already signed')
    }
    if (new Date() > this.expiresAt) {
      throw new Error('Signature request has expired')
    }

    return new ESignature(
      this.id,
      this.tenantId,
      this.documentId,
      this.documentType,
      this.signerName,
      this.signerEmail,
      this.signerPhone,
      this.token,
      this.otpCode,
      'SIGNED',
      props.signerIp ?? null,
      props.signerUserAgent ?? null,
      props.documentHashSha256 ?? null,
      props.signatureDataUrl,
      new Date(),
      this.expiresAt,
      this.createdAt,
      new Date(),
    )
  }
}
