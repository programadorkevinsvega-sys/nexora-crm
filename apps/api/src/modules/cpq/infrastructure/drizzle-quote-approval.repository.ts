import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, quoteApprovals as approvalsTable } from '@crm/database'
import { QuoteApprovalRepository } from '../domain/repositories/cpq.repository'
import { QuoteApproval } from '../domain/entities/quote-approval.entity'
import { CpqMapper } from './cpq.mapper'

@Injectable()
export class DrizzleQuoteApprovalRepository extends QuoteApprovalRepository {
  private get db() {
    return getDb()
  }

  async save(approval: QuoteApproval): Promise<void> {
    const existing = await this.findById(approval.tenantId, approval.id)
    if (existing) {
      await this.db
        .update(approvalsTable)
        .set({
          status: approval.status,
          approverUserId: approval.approverUserId,
          rejectionReason: approval.rejectionReason,
          decidedAt: approval.decidedAt,
          updatedAt: approval.updatedAt,
        })
        .where(and(eq(approvalsTable.tenantId, approval.tenantId), eq(approvalsTable.id, approval.id)))
    } else {
      await this.db.insert(approvalsTable).values({
        id: approval.id,
        tenantId: approval.tenantId,
        quoteId: approval.quoteId,
        requestedDiscountPercent: String(approval.requestedDiscountPercent),
        requestedByUserId: approval.requestedByUserId,
        approverUserId: approval.approverUserId,
        status: approval.status,
        rejectionReason: approval.rejectionReason,
        decidedAt: approval.decidedAt,
        createdAt: approval.createdAt,
        updatedAt: approval.updatedAt,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<QuoteApproval | null> {
    const rows = await this.db
      .select()
      .from(approvalsTable)
      .where(and(eq(approvalsTable.tenantId, tenantId), eq(approvalsTable.id, id)))
      .limit(1)

    return rows.length > 0 ? CpqMapper.quoteApprovalToDomain(rows[0]) : null
  }

  async findByQuoteId(tenantId: string, quoteId: string): Promise<QuoteApproval[]> {
    const rows = await this.db
      .select()
      .from(approvalsTable)
      .where(and(eq(approvalsTable.tenantId, tenantId), eq(approvalsTable.quoteId, quoteId)))

    return rows.map(CpqMapper.quoteApprovalToDomain)
  }

  async listPending(tenantId: string): Promise<QuoteApproval[]> {
    const rows = await this.db
      .select()
      .from(approvalsTable)
      .where(and(eq(approvalsTable.tenantId, tenantId), eq(approvalsTable.status, 'PENDING')))

    return rows.map(CpqMapper.quoteApprovalToDomain)
  }
}
