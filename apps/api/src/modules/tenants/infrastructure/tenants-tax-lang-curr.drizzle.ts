/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and } from 'drizzle-orm'
import {
  getDb,
  tenantTaxConfigurations as taxConfigsTable,
  tenantLanguages as languagesTable,
  tenantCurrencies as currenciesTable,
} from '@crm/database'
import {
  TaxConfiguration, TenantLanguage, TenantCurrency,
} from '../domain/entities/config.entity'
import { TenantsMapper } from './tenants.mapper'

export class TenantsTaxLangCurrDrizzleHelper {
  private static get db() { return getDb() }

  static async listTaxConfigs(tenantId: string): Promise<TaxConfiguration[]> {
    const rows = await this.db.query.tenantTaxConfigurations.findMany({
      where: eq(taxConfigsTable.tenantId, tenantId) as any,
    })
    return rows.map((r) => TenantsMapper.taxConfigToDomain(r as any))
  }

  static async findTaxConfigById(id: string): Promise<TaxConfiguration | null> {
    const row = await this.db.query.tenantTaxConfigurations.findFirst({ where: eq(taxConfigsTable.id, id) as any })
    return row ? TenantsMapper.taxConfigToDomain(row as any) : null
  }

  static async saveTaxConfig(config: TaxConfiguration): Promise<void> {
    await this.db.insert(taxConfigsTable).values({
      id: config.id,
      tenantId: config.tenantId,
      taxName: config.taxName,
      taxPercentage: String(config.taxPercentage),
      description: config.description,
      taxType: config.taxType,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    } as any).onConflictDoUpdate({
      target: taxConfigsTable.id,
      set: { taxName: config.taxName, taxPercentage: String(config.taxPercentage), updatedAt: config.updatedAt } as any,
    })
  }

  static async deleteTaxConfig(tenantId: string, id: string): Promise<void> {
    await this.db.delete(taxConfigsTable).where(and(eq(taxConfigsTable.tenantId, tenantId), eq(taxConfigsTable.id, id)) as any)
  }

  static async listLanguages(tenantId: string): Promise<TenantLanguage[]> {
    const rows = await this.db.query.tenantLanguages.findMany({ where: eq(languagesTable.tenantId, tenantId) as any })
    return rows.map((r) => TenantsMapper.languageToDomain(r as any))
  }

  static async findLanguageById(id: string): Promise<TenantLanguage | null> {
    const row = await this.db.query.tenantLanguages.findFirst({ where: eq(languagesTable.id, id) as any })
    return row ? TenantsMapper.languageToDomain(row as any) : null
  }

  static async saveLanguage(lang: TenantLanguage): Promise<void> {
    await this.db.insert(languagesTable).values({
      id: lang.id,
      tenantId: lang.tenantId,
      isoCode: lang.isoCode,
      name: lang.name,
      isDefault: lang.isDefault,
      isActive: lang.isActive,
      createdAt: lang.createdAt,
      updatedAt: lang.updatedAt,
    } as any).onConflictDoUpdate({
      target: languagesTable.id,
      set: { name: lang.name, isActive: lang.isActive, updatedAt: lang.updatedAt } as any,
    })
  }

  static async deleteLanguage(tenantId: string, id: string): Promise<void> {
    await this.db.delete(languagesTable).where(and(eq(languagesTable.tenantId, tenantId), eq(languagesTable.id, id)) as any)
  }

  static async setDefaultLanguage(tenantId: string, languageId: string): Promise<void> {
    await this.db.update(languagesTable).set({ isDefault: false } as any)
      .where(eq(languagesTable.tenantId, tenantId) as any)
    await this.db.update(languagesTable).set({ isDefault: true } as any)
      .where(and(eq(languagesTable.tenantId, tenantId), eq(languagesTable.id, languageId)) as any)
  }

  static async listCurrencies(tenantId: string): Promise<TenantCurrency[]> {
    const rows = await this.db.query.tenantCurrencies.findMany({ where: eq(currenciesTable.tenantId, tenantId) as any })
    return rows.map((r) => TenantsMapper.currencyToDomain(r as any))
  }

  static async findCurrencyById(id: string): Promise<TenantCurrency | null> {
    const row = await this.db.query.tenantCurrencies.findFirst({ where: eq(currenciesTable.id, id) as any })
    return row ? TenantsMapper.currencyToDomain(row as any) : null
  }

  static async saveCurrency(curr: TenantCurrency): Promise<void> {
    await this.db.insert(currenciesTable).values({
      id: curr.id,
      tenantId: curr.tenantId,
      isoCode: curr.isoCode,
      name: curr.name,
      symbol: curr.symbol,
      isBaseCurrency: curr.isBaseCurrency,
      isActive: curr.isActive,
      createdAt: curr.createdAt,
      updatedAt: curr.updatedAt,
    } as any).onConflictDoUpdate({
      target: currenciesTable.id,
      set: { name: curr.name, symbol: curr.symbol, updatedAt: curr.updatedAt } as any,
    })
  }

  static async deleteCurrency(tenantId: string, id: string): Promise<void> {
    await this.db.delete(currenciesTable).where(and(eq(currenciesTable.tenantId, tenantId), eq(currenciesTable.id, id)) as any)
  }

  static async setBaseCurrency(tenantId: string, currencyId: string): Promise<void> {
    await this.db.update(currenciesTable).set({ isBaseCurrency: false } as any)
      .where(eq(currenciesTable.tenantId, tenantId) as any)
    await this.db.update(currenciesTable).set({ isBaseCurrency: true } as any)
      .where(and(eq(currenciesTable.tenantId, tenantId), eq(currenciesTable.id, currencyId)) as any)
  }
}
