import { eq, and, asc, type SQL } from 'drizzle-orm'
import {
  getDb,
  tenantBranding as brandingTable, tenantFeatures as featuresTable,
  tenantDomains as domainsTable, tenantUsageMetrics as metricsTable,
  systemModules as sysModulesTable, installedModules as installedModulesTable,
} from '@crm/database'
import { TenantBranding } from '../domain/entities/branding.entity'
import { TenantFeature, TenantDomain, UsageMetric } from '../domain/entities/features.entity'
import { SystemModule, InstalledModule } from '../domain/entities/modules.entity'
import { TenantsMapper } from './tenants.mapper'

export class TenantsFeaturesDrizzleHelper {
  private static get db() { return getDb() }

  static async findBranding(tenantId: string): Promise<TenantBranding | null> {
    const row = await this.db.query.tenantBranding.findFirst({
      where: eq(brandingTable.tenantId, tenantId),
    })
    return row ? TenantsMapper.brandingToDomain(row) : null
  }

  static async saveBranding(branding: TenantBranding): Promise<void> {
    await this.db.insert(brandingTable).values({
      tenantId: branding.tenantId,
      logoUrl: branding.logoUrl,
      faviconUrl: branding.faviconUrl,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      customDomain: branding.customDomain,
      updatedAt: branding.updatedAt,
    }).onConflictDoUpdate({
      target: brandingTable.tenantId,
      set: {
        logoUrl: branding.logoUrl,
        faviconUrl: branding.faviconUrl,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        customDomain: branding.customDomain,
        updatedAt: branding.updatedAt,
      },
    })
  }

  static async listFeatures(tenantId: string): Promise<TenantFeature[]> {
    const rows = await this.db.query.tenantFeatures.findMany({
      where: eq(featuresTable.tenantId, tenantId),
    })
    return rows.map((r) => new TenantFeature(r.tenantId, r.featureCode, r.isEnabled ?? true, r.enabledAt))
  }

  static async toggleFeature(tenantId: string, featureCode: string, isEnabled: boolean): Promise<void> {
    await this.db.insert(featuresTable).values({
      tenantId,
      featureCode,
      isEnabled,
      enabledAt: new Date(),
    }).onConflictDoUpdate({
      target: [featuresTable.tenantId, featuresTable.featureCode],
      set: { isEnabled, enabledAt: new Date() },
    })
  }

  static async findDomainById(id: string): Promise<TenantDomain | null> {
    const row = await this.db.query.tenantDomains.findFirst({ where: eq(domainsTable.id, id) })
    if (!row) return null
    return new TenantDomain(row.id, row.tenantId, row.domain, row.sslStatus ?? 'PENDING', row.isPrimary ?? false, row.createdAt)
  }

  static async listDomains(tenantId: string): Promise<TenantDomain[]> {
    const rows = await this.db.query.tenantDomains.findMany({
      where: eq(domainsTable.tenantId, tenantId),
    })
    return rows.map((r) => new TenantDomain(r.id, r.tenantId, r.domain, r.sslStatus ?? 'PENDING', r.isPrimary ?? false, r.createdAt))
  }

  static async saveDomain(domain: TenantDomain): Promise<void> {
    await this.db.insert(domainsTable).values({
      id: domain.id,
      tenantId: domain.tenantId,
      domain: domain.domain,
      sslStatus: domain.sslStatus,
      isPrimary: domain.isPrimary,
      createdAt: domain.createdAt,
    }).onConflictDoNothing()
  }

  static async deleteDomain(tenantId: string, id: string): Promise<void> {
    await this.db.delete(domainsTable).where(
      and(eq(domainsTable.tenantId, tenantId), eq(domainsTable.id, id)),
    )
  }

  static async setPrimaryDomain(tenantId: string, domainId: string): Promise<void> {
    const all = await this.listDomains(tenantId)
    for (const d of all) {
      if (d.isPrimary) {
        await this.db.update(domainsTable).set({ isPrimary: false })
          .where(and(eq(domainsTable.tenantId, tenantId), eq(domainsTable.id, d.id)))
      }
    }
    if (domainId) {
      await this.db.update(domainsTable).set({ isPrimary: true })
        .where(and(eq(domainsTable.tenantId, tenantId), eq(domainsTable.id, domainId)))
    }
  }

  static async listMetrics(tenantId: string): Promise<UsageMetric[]> {
    const rows = await this.db.query.tenantUsageMetrics.findMany({
      where: eq(metricsTable.tenantId, tenantId),
    })
    return rows.map((r) => new UsageMetric(r.id, r.tenantId, r.metricName, r.currentValue, r.limitValue, r.periodStart, r.periodEnd, r.updatedAt))
  }

  static async upsertMetric(metric: UsageMetric): Promise<void> {
    await this.db.insert(metricsTable).values({
      id: metric.id,
      tenantId: metric.tenantId,
      metricName: metric.metricName,
      currentValue: metric.currentValue,
      limitValue: metric.limitValue,
      periodStart: metric.periodStart,
      periodEnd: metric.periodEnd,
      updatedAt: metric.updatedAt,
    }).onConflictDoUpdate({
      target: metricsTable.id,
      set: { currentValue: metric.currentValue, limitValue: metric.limitValue, updatedAt: metric.updatedAt },
    })
  }

  static async listSystemModules(category?: string): Promise<SystemModule[]> {
    const conditions: SQL[] = []
    if (category) conditions.push(eq(sysModulesTable.category, category))
    const rows = await this.db.query.systemModules.findMany({
      where: conditions.length ? (and(...conditions)) : undefined,
      orderBy: [asc(sysModulesTable.name)],
    })
    return rows.map((r) => TenantsMapper.sysModuleToDomain(r))
  }

  static async findSystemModuleById(id: string): Promise<SystemModule | null> {
    const row = await this.db.query.systemModules.findFirst({ where: eq(sysModulesTable.id, id) })
    return row ? TenantsMapper.sysModuleToDomain(row) : null
  }

  static async saveSystemModule(module: SystemModule): Promise<void> {
    await this.db.insert(sysModulesTable).values({
      id: module.id,
      name: module.name,
      slug: module.slug,
      description: module.description,
      iconSvg: module.iconSvg,
      category: module.category,
      isCore: module.isCore,
      isActive: module.isActive,
      version: module.version,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    }).onConflictDoUpdate({
      target: sysModulesTable.id,
      set: { name: module.name, updatedAt: module.updatedAt },
    })
  }

  static async listInstalledModules(tenantId: string): Promise<InstalledModule[]> {
    const rows = await this.db.query.installedModules.findMany({
      where: eq(installedModulesTable.tenantId, tenantId),
    })
    return rows.map((r) => TenantsMapper.installedModuleToDomain(r))
  }

  static async findInstalledModule(tenantId: string, moduleId: string): Promise<InstalledModule | null> {
    const row = await this.db.query.installedModules.findFirst({
      where: and(
        eq(installedModulesTable.tenantId, tenantId),
        eq(installedModulesTable.moduleId, moduleId),
      ),
    })
    return row ? TenantsMapper.installedModuleToDomain(row) : null
  }

  static async installModule(module: InstalledModule): Promise<void> {
    await this.db.insert(installedModulesTable).values({
      id: module.id,
      tenantId: module.tenantId,
      moduleId: module.moduleId,
      status: module.status,
      installedAt: module.installedAt,
      configurationJson: module.configurationJson,
    }).onConflictDoNothing()
  }

  static async uninstallModule(tenantId: string, moduleId: string): Promise<void> {
    await this.db.delete(installedModulesTable).where(
      and(
        eq(installedModulesTable.tenantId, tenantId),
        eq(installedModulesTable.moduleId, moduleId),
      ),
    )
  }
}
