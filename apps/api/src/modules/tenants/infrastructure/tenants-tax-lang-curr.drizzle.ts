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
      where: eq(taxConfigsTable.tenantId, tenantId),
    })
    return rows.map((r) => TenantsMapper.taxConfigToDomain(r))
  }

  static async findTaxConfigById(id: string): Promise<TaxConfiguration | null> {
    const row = await this.db.query.tenantTaxConfigurations.findFirst({ where: eq(taxConfigsTable.id, id) })
    return row ? TenantsMapper.taxConfigToDomain(row) : null
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
    }).onConflictDoUpdate({
      target: taxConfigsTable.id,
      set: { taxName: config.taxName, taxPercentage: String(config.taxPercentage), updatedAt: config.updatedAt },
    })
  }

  static async deleteTaxConfig(tenantId: string, id: string): Promise<void> {
    await this.db.delete(taxConfigsTable).where(and(eq(taxConfigsTable.tenantId, tenantId), eq(taxConfigsTable.id, id)))
  }

  static async listLanguages(tenantId: string): Promise<TenantLanguage[]> {
    const rows = await this.db.query.tenantLanguages.findMany({ where: eq(languagesTable.tenantId, tenantId) })
    return rows.map((r) => TenantsMapper.languageToDomain(r))
  }

  static async findLanguageById(id: string): Promise<TenantLanguage | null> {
    const row = await this.db.query.tenantLanguages.findFirst({ where: eq(languagesTable.id, id) })
    return row ? TenantsMapper.languageToDomain(row) : null
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
    }).onConflictDoUpdate({
      target: languagesTable.id,
      set: { name: lang.name, isActive: lang.isActive, updatedAt: lang.updatedAt },
    })
  }

  static async deleteLanguage(tenantId: string, id: string): Promise<void> {
    await this.db.delete(languagesTable).where(and(eq(languagesTable.tenantId, tenantId), eq(languagesTable.id, id)))
  }

  static async setDefaultLanguage(tenantId: string, languageId: string): Promise<void> {
    await this.db.update(languagesTable).set({ isDefault: false })
      .where(eq(languagesTable.tenantId, tenantId))
    await this.db.update(languagesTable).set({ isDefault: true })
      .where(and(eq(languagesTable.tenantId, tenantId), eq(languagesTable.id, languageId)))
  }

  static async listCurrencies(tenantId: string): Promise<TenantCurrency[]> {
    const rows = await this.db.query.tenantCurrencies.findMany({ where: eq(currenciesTable.tenantId, tenantId) })
    return rows.map((r) => TenantsMapper.currencyToDomain(r))
  }

  static async findCurrencyById(id: string): Promise<TenantCurrency | null> {
    const row = await this.db.query.tenantCurrencies.findFirst({ where: eq(currenciesTable.id, id) })
    return row ? TenantsMapper.currencyToDomain(row) : null
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
    }).onConflictDoUpdate({
      target: currenciesTable.id,
      set: { name: curr.name, symbol: curr.symbol, updatedAt: curr.updatedAt },
    })
  }

  static async deleteCurrency(tenantId: string, id: string): Promise<void> {
    await this.db.delete(currenciesTable).where(and(eq(currenciesTable.tenantId, tenantId), eq(currenciesTable.id, id)))
  }

  static async setBaseCurrency(tenantId: string, currencyId: string): Promise<void> {
    await this.db.update(currenciesTable).set({ isBaseCurrency: false })
      .where(eq(currenciesTable.tenantId, tenantId))
    await this.db.update(currenciesTable).set({ isBaseCurrency: true })
      .where(and(eq(currenciesTable.tenantId, tenantId), eq(currenciesTable.id, currencyId)))
  }
}
