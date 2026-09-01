import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, eSignatures as signaturesTable } from '@crm/database'
import { ESignatureRepository } from '../domain/repositories/cpq.repository'
import { ESignature } from '../domain/entities/e-signature.entity'
import { CpqMapper } from './cpq.mapper'

@Injectable()
export class DrizzleESignatureRepository extends ESignatureRepository {
  private get db() {
    return getDb()
  }

  async save(sig: ESignature): Promise<void> {
    const existing = await this.findById(sig.tenantId, sig.id)
    if (existing) {
      await this.db
        .update(signaturesTable)
        .set({
          status: sig.status,
          signerIp: sig.signerIp,
          signerUserAgent: sig.signerUserAgent,
          documentHashSha256: sig.documentHashSha256,
          signatureDataUrl: sig.signatureDataUrl,
          signedAt: sig.signedAt,
          updatedAt: sig.updatedAt,
        })
        .where(and(eq(signaturesTable.tenantId, sig.tenantId), eq(signaturesTable.id, sig.id)))
    } else {
      await this.db.insert(signaturesTable).values({
        id: sig.id,
        tenantId: sig.tenantId,
        documentId: sig.documentId,
        documentType: sig.documentType,
        signerName: sig.signerName,
        signerEmail: sig.signerEmail,
        signerPhone: sig.signerPhone,
        token: sig.token,
        otpCode: sig.otpCode,
        status: sig.status,
        signerIp: sig.signerIp,
        signerUserAgent: sig.signerUserAgent,
        documentHashSha256: sig.documentHashSha256,
        signatureDataUrl: sig.signatureDataUrl,
        signedAt: sig.signedAt,
        expiresAt: sig.expiresAt,
        createdAt: sig.createdAt,
        updatedAt: sig.updatedAt,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<ESignature | null> {
    const rows = await this.db
      .select()
      .from(signaturesTable)
      .where(and(eq(signaturesTable.tenantId, tenantId), eq(signaturesTable.id, id)))
      .limit(1)

    return rows.length > 0 ? CpqMapper.signatureToDomain(rows[0]) : null
  }

  async findByToken(token: string): Promise<ESignature | null> {
    const rows = await this.db
      .select()
      .from(signaturesTable)
      .where(eq(signaturesTable.token, token))
      .limit(1)

    return rows.length > 0 ? CpqMapper.signatureToDomain(rows[0]) : null
  }

  async findByDocumentId(tenantId: string, documentId: string): Promise<ESignature[]> {
    const rows = await this.db
      .select()
      .from(signaturesTable)
      .where(and(eq(signaturesTable.tenantId, tenantId), eq(signaturesTable.documentId, documentId)))

    return rows.map(CpqMapper.signatureToDomain)
  }
}
