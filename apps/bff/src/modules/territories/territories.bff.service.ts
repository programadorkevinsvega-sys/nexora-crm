import { Injectable, Logger } from '@nestjs/common'
import { getDb, salesTerritories, territoryMembers } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { TerritoryRouterHelper } from './territory-router.helper'
import type {
  SalesTerritory,
  CreateTerritoryDto,
  TerritoryMember,
  TerritoryMemberRole,
  RouteLeadToTerritoryDto,
} from '@crm/contracts'

@Injectable()
export class TerritoriesBffService {
  private readonly logger = new Logger(TerritoriesBffService.name)
  private get db() {
    return getDb()
  }

  async listTerritories(tenantId: string): Promise<SalesTerritory[]> {
    let rows = await this.db
      .select()
      .from(salesTerritories)
      .where(eq(salesTerritories.tenantId, tenantId))
      .orderBy(desc(salesTerritories.createdAt))

    if (rows.length === 0) {
      await this.seedDefaultTerritories(tenantId)
      rows = await this.db
        .select()
        .from(salesTerritories)
        .where(eq(salesTerritories.tenantId, tenantId))
        .orderBy(desc(salesTerritories.createdAt))
    }

    return rows.map((r) => this.mapTerritory(r))
  }

  async createTerritory(tenantId: string, dto: CreateTerritoryDto): Promise<SalesTerritory> {
    const [created] = await this.db
      .insert(salesTerritories)
      .values({
        tenantId,
        name: dto.name,
        code: dto.code.toUpperCase(),
        description: dto.description || null,
        countryCodes: dto.countryCodes || [],
        regions: dto.regions || [],
        industries: dto.industries || [],
        minEmployeeCount: dto.minEmployeeCount || 1,
        maxEmployeeCount: dto.maxEmployeeCount || null,
        quotaTargetUsd: String(dto.quotaTargetUsd || 100000.0),
        isActive: dto.isActive ?? true,
      })
      .returning()

    this.logger.log(`Created territory: ${created.id} (${created.name})`)
    return this.mapTerritory(created)
  }

  async assignMember(
    tenantId: string,
    territoryId: string,
    userId: string,
    role: TerritoryMemberRole = 'ACCOUNT_EXEC',
  ): Promise<TerritoryMember> {
    const [member] = await this.db
      .insert(territoryMembers)
      .values({
        tenantId,
        territoryId,
        userId,
        role,
      })
      .returning()

    this.logger.log(`Assigned user ${userId} to territory ${territoryId} as ${role}`)
    return this.mapMember(member)
  }

  async listMembers(tenantId: string, territoryId: string): Promise<TerritoryMember[]> {
    const rows = await this.db
      .select()
      .from(territoryMembers)
      .where(and(eq(territoryMembers.tenantId, tenantId), eq(territoryMembers.territoryId, territoryId)))

    return rows.map((r) => this.mapMember(r))
  }

  async routeLead(tenantId: string, dto: RouteLeadToTerritoryDto): Promise<SalesTerritory | null> {
    const territories = await this.listTerritories(tenantId)
    const match = TerritoryRouterHelper.findBestTerritory(territories, dto)
    if (match) {
      this.logger.log(`Lead routed to territory: ${match.name} (${match.code})`)
    }
    return match
  }

  private async seedDefaultTerritories(tenantId: string) {
    await this.db.insert(salesTerritories).values([
      {
        tenantId,
        name: 'Región Andina (Colombia, Perú, Ecuador)',
        code: 'TERR-ANDES',
        description: 'Territorio comercial enfocado en sector Corporativo B2B y Fintech.',
        countryCodes: ['CO', 'PE', 'EC'],
        regions: ['Andina', 'Pacífico'],
        industries: ['FINTECH', 'SAAS', 'LOGISTICS'],
        quotaTargetUsd: '250000.00',
        isActive: true,
      },
      {
        tenantId,
        name: 'México & Norteamérica B2B',
        code: 'TERR-MEX-NA',
        description: 'Territorio de expansión estratégica para manufactura y retail enterprise.',
        countryCodes: ['MX', 'US', 'CA'],
        regions: ['Norteamérica'],
        industries: ['RETAIL', 'MANUFACTURING', 'HEALTHCARE'],
        quotaTargetUsd: '450000.00',
        isActive: true,
      },
      {
        tenantId,
        name: 'Cono Sur (Chile, Argentina, Uruguay)',
        code: 'TERR-CONOSUR',
        description: 'Territorio de servicios financieros y banca digital.',
        countryCodes: ['CL', 'AR', 'UY'],
        regions: ['Cono Sur'],
        industries: ['BANKING', 'TELECOM', 'ECOMMERCE'],
        quotaTargetUsd: '200000.00',
        isActive: true,
      },
    ])
  }

  private mapTerritory(r: typeof salesTerritories.$inferSelect): SalesTerritory {
    return {
      ...r,
      countryCodes: Array.isArray(r.countryCodes) ? r.countryCodes : [],
      regions: Array.isArray(r.regions) ? r.regions : [],
      industries: Array.isArray(r.industries) ? r.industries : [],
      quotaTargetUsd: Number(r.quotaTargetUsd) || 0,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapMember(r: typeof territoryMembers.$inferSelect): TerritoryMember {
    return {
      ...r,
      role: r.role as TerritoryMemberRole,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }
  }
}
