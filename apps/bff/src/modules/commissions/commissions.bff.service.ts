import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, commissionPlans, commissionRecords } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { CommissionsCalculatorHelper } from './commissions-calculator.helper'
import type {
  CommissionPlan,
  CreateCommissionPlanDto,
  CommissionRecord,
  CalculateCommissionDto,
} from '@crm/contracts'

@Injectable()
export class CommissionsBffService {
  private readonly logger = new Logger(CommissionsBffService.name)
  private get db() {
    return getDb()
  }

  async listPlans(tenantId: string): Promise<CommissionPlan[]> {
    let rows = await this.db
      .select()
      .from(commissionPlans)
      .where(eq(commissionPlans.tenantId, tenantId))
      .orderBy(desc(commissionPlans.createdAt))

    if (rows.length === 0) {
      await this.seedDefaultPlan(tenantId)
      rows = await this.db
        .select()
        .from(commissionPlans)
        .where(eq(commissionPlans.tenantId, tenantId))
        .orderBy(desc(commissionPlans.createdAt))
    }

    return rows.map((r) => this.mapPlan(r))
  }

  async createPlan(tenantId: string, dto: CreateCommissionPlanDto): Promise<CommissionPlan> {
    const [created] = await this.db
      .insert(commissionPlans)
      .values({
        tenantId,
        name: dto.name,
        description: dto.description || null,
        calculationModel: dto.calculationModel,
        baseRate: String(dto.baseRate),
        tierRules: dto.tierRules || [],
        acceleratorRate: dto.acceleratorRate ? String(dto.acceleratorRate) : null,
        isActive: dto.isActive ?? true,
      })
      .returning()

    this.logger.log(`Created Commission Plan: ${created.id} (${created.name})`)
    return this.mapPlan(created)
  }

  async calculateAndRecordCommission(
    tenantId: string,
    dto: CalculateCommissionDto,
  ): Promise<CommissionRecord> {
    const plans = await this.listPlans(tenantId)
    const activePlan = plans.find((p) => p.isActive) || null
    const { rate, amount } = CommissionsCalculatorHelper.computeCommission(activePlan, dto)

    const now = new Date()
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const [record] = await this.db
      .insert(commissionRecords)
      .values({
        tenantId,
        planId: activePlan?.id || null,
        dealId: dto.dealId,
        userId: dto.userId,
        dealValue: String(dto.dealValue),
        commissionRate: String(rate),
        commissionAmount: String(amount),
        splitPercentage: String(dto.splitPercentage || 100),
        status: 'PENDING',
        period,
      })
      .returning()

    this.logger.log(`Recorded Commission for deal ${dto.dealId}: $${amount} (${rate}%)`)
    return this.mapRecord(record)
  }

  async listRecords(tenantId: string, userId?: string, period?: string): Promise<CommissionRecord[]> {
    const conditions = [eq(commissionRecords.tenantId, tenantId)]
    if (userId) conditions.push(eq(commissionRecords.userId, userId))
    if (period) conditions.push(eq(commissionRecords.period, period))

    const rows = await this.db
      .select()
      .from(commissionRecords)
      .where(and(...conditions))
      .orderBy(desc(commissionRecords.createdAt))

    return rows.map((r) => this.mapRecord(r))
  }

  async approveRecord(tenantId: string, recordId: string, approverUserId: string): Promise<CommissionRecord> {
    const [updated] = await this.db
      .update(commissionRecords)
      .set({
        status: 'APPROVED',
        approvedByUserId: approverUserId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(commissionRecords.id, recordId), eq(commissionRecords.tenantId, tenantId)))
      .returning()

    if (!updated) throw new NotFoundException(`Registro de comisión no encontrado: ${recordId}`)
    return this.mapRecord(updated)
  }

  async markAsPaid(tenantId: string, recordId: string): Promise<CommissionRecord> {
    const [updated] = await this.db
      .update(commissionRecords)
      .set({
        status: 'PAID',
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(commissionRecords.id, recordId), eq(commissionRecords.tenantId, tenantId)))
      .returning()

    if (!updated) throw new NotFoundException(`Registro de comisión no encontrado: ${recordId}`)
    return this.mapRecord(updated)
  }

  private async seedDefaultPlan(tenantId: string) {
    await this.db.insert(commissionPlans).values({
      tenantId,
      name: 'Plan Estándar Ventas B2B & Acelerador 100%+',
      description: '5% tasa base, escalable a 8.5% al superar la cuota mensual asignada.',
      calculationModel: 'ACCELERATOR',
      baseRate: '5.00',
      acceleratorRate: '8.50',
      tierRules: [
        { minQuotaPct: 100, rate: 8.5 },
        { minQuotaPct: 120, rate: 12.0 },
      ],
      isActive: true,
    })
  }

  private mapPlan(r: typeof commissionPlans.$inferSelect): CommissionPlan {
    return {
      ...r,
      baseRate: Number(r.baseRate) || 0,
      acceleratorRate: r.acceleratorRate ? Number(r.acceleratorRate) : undefined,
      tierRules: Array.isArray(r.tierRules) ? r.tierRules : [],
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapRecord(r: typeof commissionRecords.$inferSelect): CommissionRecord {
    return {
      ...r,
      dealValue: Number(r.dealValue) || 0,
      commissionRate: Number(r.commissionRate) || 0,
      commissionAmount: Number(r.commissionAmount) || 0,
      splitPercentage: Number(r.splitPercentage) || 100,
      approvedAt: r.approvedAt ? new Date(r.approvedAt).toISOString() : undefined,
      paidAt: r.paidAt ? new Date(r.paidAt).toISOString() : undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }
}
