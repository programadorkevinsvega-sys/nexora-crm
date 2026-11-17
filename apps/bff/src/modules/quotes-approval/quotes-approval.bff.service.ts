import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  getDb,
  discountApprovalRules,
  quoteApprovalRequests,
  customerQuoteAcceptances,
} from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import type {
  DiscountApprovalRule,
  CreateDiscountApprovalRuleDto,
  QuoteApprovalRequest,
  RequestQuoteApprovalDto,
  CustomerQuoteAcceptance,
  SubmitCustomerQuoteAcceptanceDto,
} from '@crm/contracts'

@Injectable()
export class QuotesApprovalBffService {
  private readonly logger = new Logger(QuotesApprovalBffService.name)
  private get db() {
    return getDb()
  }

  async listRules(tenantId: string): Promise<DiscountApprovalRule[]> {
    let rows = await this.db
      .select()
      .from(discountApprovalRules)
      .where(eq(discountApprovalRules.tenantId, tenantId))
      .orderBy(discountApprovalRules.minDiscountPct)

    if (rows.length === 0) {
      await this.seedDefaultRules(tenantId)
      rows = await this.db
        .select()
        .from(discountApprovalRules)
        .where(eq(discountApprovalRules.tenantId, tenantId))
        .orderBy(discountApprovalRules.minDiscountPct)
    }

    return rows.map((r) => this.mapRule(r))
  }

  async createRule(tenantId: string, dto: CreateDiscountApprovalRuleDto): Promise<DiscountApprovalRule> {
    const [created] = await this.db
      .insert(discountApprovalRules)
      .values({
        tenantId,
        minDiscountPct: String(dto.minDiscountPct),
        maxDiscountPct: String(dto.maxDiscountPct),
        approverRole: dto.approverRole || 'SALES_MANAGER',
        requiresStrictApproval: dto.requiresStrictApproval ?? true,
      })
      .returning()

    return this.mapRule(created)
  }

  async listApprovalRequests(tenantId: string): Promise<QuoteApprovalRequest[]> {
    const rows = await this.db
      .select()
      .from(quoteApprovalRequests)
      .where(eq(quoteApprovalRequests.tenantId, tenantId))
      .orderBy(desc(quoteApprovalRequests.createdAt))

    return rows.map((r) => this.mapRequest(r))
  }

  async requestApproval(tenantId: string, dto: RequestQuoteApprovalDto, userId?: string): Promise<QuoteApprovalRequest> {
    const [created] = await this.db
      .insert(quoteApprovalRequests)
      .values({
        tenantId,
        quoteId: dto.quoteId,
        requestedDiscountPct: String(dto.requestedDiscountPct),
        status: 'PENDING',
        requestedByUserId: userId || null,
      })
      .returning()

    this.logger.log(`Requested Discount Approval for Quote ${dto.quoteId}: ${dto.requestedDiscountPct}%`)
    return this.mapRequest(created)
  }

  async reviewApproval(
    tenantId: string,
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewerId?: string,
    notes?: string,
  ): Promise<QuoteApprovalRequest> {
    const [updated] = await this.db
      .update(quoteApprovalRequests)
      .set({
        status,
        reviewedByUserId: reviewerId || null,
        reviewNotes: notes || null,
        reviewedAt: new Date(),
      })
      .where(and(eq(quoteApprovalRequests.id, requestId), eq(quoteApprovalRequests.tenantId, tenantId)))
      .returning()

    if (!updated) throw new NotFoundException('Solicitud de aprobación no encontrada')
    return this.mapRequest(updated)
  }

  async generateCustomerToken(tenantId: string, quoteId: string): Promise<CustomerQuoteAcceptance> {
    const securityToken = `qtok_${randomBytes(24).toString('hex')}`
    const [created] = await this.db
      .insert(customerQuoteAcceptances)
      .values({
        tenantId,
        quoteId,
        securityToken,
        status: 'VIEWED',
      })
      .returning()

    return this.mapAcceptance(created)
  }

  async getCustomerQuoteAcceptance(token: string): Promise<CustomerQuoteAcceptance> {
    const [row] = await this.db
      .select()
      .from(customerQuoteAcceptances)
      .where(eq(customerQuoteAcceptances.securityToken, token))

    if (!row) throw new NotFoundException('Enlace de cotización no válido o expirado')
    return this.mapAcceptance(row)
  }

  async submitCustomerAcceptance(
    token: string,
    dto: SubmitCustomerQuoteAcceptanceDto,
    ipAddress?: string,
  ): Promise<CustomerQuoteAcceptance> {
    const [updated] = await this.db
      .update(customerQuoteAcceptances)
      .set({
        status: dto.status,
        clientSignerName: dto.clientSignerName,
        clientSignerEmail: dto.clientSignerEmail,
        clientIpAddress: ipAddress || null,
        feedback: dto.feedback || null,
        acceptedAt: new Date(),
      })
      .where(eq(customerQuoteAcceptances.securityToken, token))
      .returning()

    if (!updated) throw new NotFoundException('Token de cotización no encontrado')
    return this.mapAcceptance(updated)
  }

  private async seedDefaultRules(tenantId: string) {
    await this.db.insert(discountApprovalRules).values([
      { tenantId, minDiscountPct: '10.00', maxDiscountPct: '20.00', approverRole: 'SALES_MANAGER', requiresStrictApproval: true },
      { tenantId, minDiscountPct: '20.01', maxDiscountPct: '35.00', approverRole: 'VP_SALES', requiresStrictApproval: true },
      { tenantId, minDiscountPct: '35.01', maxDiscountPct: '100.00', approverRole: 'CFO', requiresStrictApproval: true },
    ])
  }

  private mapRule(r: any): DiscountApprovalRule {
    return {
      ...r,
      minDiscountPct: Number(r.minDiscountPct) || 0,
      maxDiscountPct: Number(r.maxDiscountPct) || 0,
      approverRole: r.approverRole as any,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapRequest(r: any): QuoteApprovalRequest {
    return {
      ...r,
      status: r.status as any,
      requestedDiscountPct: Number(r.requestedDiscountPct) || 0,
      reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapAcceptance(r: any): CustomerQuoteAcceptance {
    return {
      ...r,
      status: r.status as any,
      acceptedAt: r.acceptedAt ? new Date(r.acceptedAt).toISOString() : undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }
  }
}
