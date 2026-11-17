import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  getDb,
  branches,
  tenantTaxConfigurations,
  tenantCurrencies,
  tenantExchangeRates,
} from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type {
  Branch,
  CreateBranchDto,
  TenantTax,
  CreateTenantTaxDto,
  TenantCurrency,
  CreateTenantCurrencyDto,
} from '@crm/contracts'

@Injectable()
export class TenantConfigBffService {
  private readonly logger = new Logger(TenantConfigBffService.name)
  private get db() {
    return getDb()
  }

  // --- 1. BRANCHES (SUCURSALES) ---
  async listBranches(tenantId: string): Promise<Branch[]> {
    const rows = await this.db
      .select()
      .from(branches)
      .where(eq(branches.tenantId, tenantId))
      .orderBy(desc(branches.isHeadquarters), desc(branches.createdAt))

    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      code: r.code,
      address: r.address,
      city: r.city,
      country: r.country,
      isActive: r.isActive ?? true,
      isHeadquarters: r.isHeadquarters ?? false,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  }

  async createBranch(tenantId: string, dto: CreateBranchDto): Promise<Branch> {
    const [created] = await this.db
      .insert(branches)
      .values({
        tenantId,
        name: dto.name,
        code: dto.code || null,
        address: dto.address || null,
        city: dto.city || null,
        country: dto.country || null,
        isHeadquarters: dto.isHeadquarters ?? false,
        isActive: true,
      })
      .returning()

    return {
      id: created.id,
      tenantId: created.tenantId,
      name: created.name,
      code: created.code,
      address: created.address,
      city: created.city,
      country: created.country,
      isActive: created.isActive ?? true,
      isHeadquarters: created.isHeadquarters ?? false,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  }

  // --- 2. TAXES (IMPUESTOS POR EMPRESA) ---
  async listTaxes(tenantId: string): Promise<TenantTax[]> {
    const rows = await this.db
      .select()
      .from(tenantTaxConfigurations)
      .where(eq(tenantTaxConfigurations.tenantId, tenantId))
      .orderBy(desc(tenantTaxConfigurations.createdAt))

    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      taxName: r.taxName,
      taxPercentage: Number(r.taxPercentage),
      taxType: (r.taxType as any) || 'SALES',
      description: r.description,
      isActive: r.isActive ?? true,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  }

  async createTax(tenantId: string, dto: CreateTenantTaxDto): Promise<TenantTax> {
    const [created] = await this.db
      .insert(tenantTaxConfigurations)
      .values({
        tenantId,
        taxName: dto.taxName,
        taxPercentage: dto.taxPercentage.toString(),
        taxType: dto.taxType || 'SALES',
        description: dto.description || null,
        isActive: true,
      })
      .returning()

    return {
      id: created.id,
      tenantId: created.tenantId,
      taxName: created.taxName,
      taxPercentage: Number(created.taxPercentage),
      taxType: (created.taxType as any) || 'SALES',
      description: created.description,
      isActive: created.isActive ?? true,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  }

  // --- 3. CURRENCIES (MULTIDIVISA) ---
  async listCurrencies(tenantId: string): Promise<TenantCurrency[]> {
    const rows = await this.db
      .select()
      .from(tenantCurrencies)
      .where(eq(tenantCurrencies.tenantId, tenantId))
      .orderBy(desc(tenantCurrencies.isBaseCurrency), desc(tenantCurrencies.createdAt))

    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      isoCode: r.isoCode,
      name: r.name,
      symbol: r.symbol,
      isBaseCurrency: r.isBaseCurrency ?? false,
      isActive: r.isActive ?? true,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  }

  async createCurrency(tenantId: string, dto: CreateTenantCurrencyDto): Promise<TenantCurrency> {
    const [created] = await this.db
      .insert(tenantCurrencies)
      .values({
        tenantId,
        isoCode: dto.isoCode.toUpperCase(),
        name: dto.name,
        symbol: dto.symbol,
        isBaseCurrency: dto.isBaseCurrency ?? false,
        isActive: true,
      })
      .returning()

    return {
      id: created.id,
      tenantId: created.tenantId,
      isoCode: created.isoCode,
      name: created.name,
      symbol: created.symbol,
      isBaseCurrency: created.isBaseCurrency ?? false,
      isActive: created.isActive ?? true,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  }
}
