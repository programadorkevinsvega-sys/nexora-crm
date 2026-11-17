import { ESignature } from '../../domain/entities/e-signature.entity'

describe('ESignature Entity', () => {
  it('should initiate signature with token, OTP code, and 7 days expiration', () => {
    const sig = ESignature.initiate({
      tenantId: 'tenant-1',
      documentId: 'doc-123',
      signerName: 'Jane Doe',
      signerEmail: 'jane@enterprise.com',
    })

    expect(sig.status).toBe('PENDING')
    expect(sig.token).toBeDefined()
    expect(sig.otpCode).toHaveLength(6)
    expect(sig.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('should verify correct OTP code', () => {
    const sig = ESignature.initiate({
      tenantId: 'tenant-1',
      documentId: 'doc-123',
      signerName: 'Jane Doe',
      signerEmail: 'jane@enterprise.com',
    })

    const verified = sig.verifyOtp(sig.otpCode!)
    expect(verified.status).toBe('OTP_VERIFIED')
  })

  it('should sign document and record audit metadata', () => {
    const sig = ESignature.initiate({
      tenantId: 'tenant-1',
      documentId: 'doc-123',
      signerName: 'Jane Doe',
      signerEmail: 'jane@enterprise.com',
    })

    const signed = sig.sign({
      signatureDataUrl: 'data:image/png;base64,mockSignatureData',
      signerIp: '192.168.1.50',
      signerUserAgent: 'Mozilla/5.0 Chrome',
      documentHashSha256: 'a1b2c3d4e5f6',
    })

    expect(signed.status).toBe('SIGNED')
    expect(signed.signedAt).toBeInstanceOf(Date)
    expect(signed.signerIp).toBe('192.168.1.50')
  })
})
