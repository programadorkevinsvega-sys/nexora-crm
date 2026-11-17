import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, partnerTiers, partners, partnerDealRegistrations } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type {
  PartnerTier,
  Partner,
  CreatePartnerDto,
  PartnerDealRegistration,
  CreateDealRegistrationDto,
} from '@crm/contracts'

@Injectable()
export class PrmBffService {
  private readonly logger = new Logger(PrmBffService.name)
  private get db() {
    return getDb()
  }

  async listTiers(tenantId: string): Promise<PartnerTier[]> {
    let rows = await this.db
      .select()
      .from(partnerTiers)
      .where(eq(partnerTiers.tenantId, tenantId))
      .orderBy(desc(partnerTiers.discountMarginPct))

    if (rows.length === 0) {
      await this.seedDefaultTiers(tenantId)
      rows = await this.db
        .select()
        .from(partnerTiers)
        .where(eq(partnerTiers.tenantId, tenantId))
        .orderBy(desc(partnerTiers.discountMarginPct))
    }

    return rows.map((r) => this.mapTier(r))
  }

  async listPartners(tenantId: string): Promise<Partner[]> {
    const rows = await this.db
      .select()
      .from(partners)
      .where(eq(partners.tenantId, tenantId))
      .orderBy(desc(partners.createdAt))

    return rows.map((r) => this.mapPartner(r))
  }

  async createPartner(tenantId: string, dto: CreatePartnerDto): Promise<Partner> {
    const [created] = await this.db
      .insert(partners)
      .values({
        tenantId,
        companyId: dto.companyId || null,
        tierId: dto.tierId,
        partnerName: dto.partnerName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone || null,
        status: dto.status || 'ACTIVE',
      })
      .returning()

    this.logger.log(`Created Partner: ${created.id} (${created.partnerName})`)
    return this.mapPartner(created)
  }

  async listDealRegistrations(tenantId: string, partnerId?: string): Promise<PartnerDealRegistration[]> {
    const conditions = [eq(partnerDealRegistrations.tenantId, tenantId)]
    if (partnerId) conditions.push(eq(partnerDealRegistrations.partnerId, partnerId))

    const rows = await this.db
      .select()
      .from(partnerDealRegistrations)
      .where(and(...conditions))
      .orderBy(desc(partnerDealRegistrations.createdAt))

    return rows.map((r) => this.mapDealReg(r))
  }

  async submitDealRegistration(
    tenantId: string,
    dto: CreateDealRegistrationDto,
  ): Promise<PartnerDealRegistration> {
    const protectedUntil = new Date()
    protectedUntil.setDate(protectedUntil.getDate() + 90) // 90 days deal protection

    const [created] = await this.db
      .insert(partnerDealRegistrations)
      .values({
        tenantId,
        partnerId: dto.partnerId,
        prospectCompanyName: dto.prospectCompanyName,
        contactEmail: dto.contactEmail,
        estimatedValueUsd: String(dto.estimatedValueUsd),
        productCategory: dto.productCategory || 'SAAS_ENTERPRISE',
        status: 'SUBMITTED',
        protectedUntil,
        notes: dto.notes || null,
      })
      .returning()

    this.logger.log(`Submitted Deal Registration for partner ${dto.partnerId}: ${dto.prospectCompanyName}`)
    return this.mapDealReg(created)
  }

  async approveDealRegistration(
    tenantId: string,
    registrationId: string,
    reviewerUserId: string,
  ): Promise<PartnerDealRegistration> {
    const [updated] = await this.db
      .update(partnerDealRegistrations)
      .set({
        status: 'APPROVED',
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(partnerDealRegistrations.id, registrationId), eq(partnerDealRegistrations.tenantId, tenantId)))
      .returning()

    if (!updated) throw new NotFoundException(`Registro de deal no encontrado: ${registrationId}`)
    return this.mapDealReg(updated)
  }

  private async seedDefaultTiers(tenantId: string) {
    await this.db.insert(partnerTiers).values([
      {
        tenantId,
        name: 'Platinum Elite Partner',
        code: 'PLATINUM',
        minAnnualRevenueUsd: '200000.00',
        discountMarginPct: '35.00',
        mdfAllowanceUsd: '15000.00',
        benefits: ['35% Margen de Descuento', 'Fondo MDF $15k USD', 'Soporte Técnico L3 Dedicado', 'Deal Protection 120 días'],
      },
      {
        tenantId,
        name: 'Gold Premier Partner',
        code: 'GOLD',
        minAnnualRevenueUsd: '100000.00',
        discountMarginPct: '25.00',
        mdfAllowanceUsd: '8000.00',
        benefits: ['25% Margen de Descuento', 'Fondo MDF $8k USD', 'Capacitación Comercial Avanzada', 'Deal Protection 90 días'],
      },
      {
        tenantId,
        name: 'Silver Registered Partner',
        code: 'SILVER',
        minAnnualRevenueUsd: '30000.00',
        discountMarginPct: '15.00',
        mdfAllowanceUsd: '2500.00',
        benefits: ['15% Margen de Descuento', 'Portal de Partners PRM', 'Deal Protection 60 días'],
      },
    ])
  }

  private mapTier(r: any): PartnerTier {
    return {
      ...r,
      code: r.code as any,
      minAnnualRevenueUsd: Number(r.minAnnualRevenueUsd) || 0,
      discountMarginPct: Number(r.discountMarginPct) || 0,
      mdfAllowanceUsd: Number(r.mdfAllowanceUsd) || 0,
      benefits: Array.isArray(r.benefits) ? r.benefits : [],
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapPartner(r: any): Partner {
    return {
      ...r,
      status: r.status as any,
      joinedAt: r.joinedAt ? new Date(r.joinedAt).toISOString() : new Date().toISOString(),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapDealReg(r: any): PartnerDealRegistration {
    return {
      ...r,
      status: r.status as any,
      estimatedValueUsd: Number(r.estimatedValueUsd) || 0,
      protectedUntil: r.protectedUntil ? new Date(r.protectedUntil).toISOString() : undefined,
      reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }
}
