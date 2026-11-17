/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and, ilike, gt, asc } from 'drizzle-orm'
import {
  getDb,
  tenants as tenantsTable,
  branches as branchesTable,
  tenantFeatures as featuresTable,
  tenantDomains as domainsTable,
  tenantUsageMetrics as metricsTable,
  installedModules as installedModulesTable,
  tenantBranding as brandingTable,
} from '@crm/database'
import { Tenant } from '../domain/entities/tenant.entity'
import { Branch } from '../domain/entities/branch.entity'
import { PaginatedTenants } from '../domain/repositories/tenants.repository'
import { TenantsMapper } from './tenants.mapper'

export class TenantsCoreDrizzleHelper {
  private static get db() { return getDb() }

  static async findTenantById(id: string): Promise<Tenant | null> {
    const row = await this.db.query.tenants.findFirst({ where: eq(tenantsTable.id, id) as any })
    return row ? TenantsMapper.tenantToDomain(row as any) : null
  }

  static async listTenants(search?: string, status?: string, cursor?: string, limit = 20): Promise<PaginatedTenants> {
    const conditions: any[] = []
    if (cursor) conditions.push(gt(tenantsTable.createdAt, new Date(cursor)))
    if (search) conditions.push(ilike(tenantsTable.name, `%${search}%`) as any)
    if (status) conditions.push(eq(tenantsTable.status, status) as any)

    const rows = await this.db.query.tenants.findMany({
      where: conditions.length ? (and(...conditions) as any) : undefined,
      limit: limit + 1,
      orderBy: [asc(tenantsTable.createdAt), asc(tenantsTable.id)],
    })
    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows
    return {
      data: data.map((r) => TenantsMapper.tenantToDomain(r as any)),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  static async saveTenant(tenant: Tenant): Promise<void> {
    const row = TenantsMapper.tenantToPersistence(tenant)
    await this.db.insert(tenantsTable).values(row as any).onConflictDoUpdate({
      target: tenantsTable.id,
      set: row as any,
    })
  }

  static async deleteTenant(id: string): Promise<void> {
    await this.db.delete(branchesTable).where(eq(branchesTable.tenantId, id) as any)
    await this.db.delete(featuresTable).where(eq(featuresTable.tenantId, id) as any)
    await this.db.delete(domainsTable).where(eq(domainsTable.tenantId, id) as any)
    await this.db.delete(metricsTable).where(eq(metricsTable.tenantId, id) as any)
    await this.db.delete(installedModulesTable).where(eq(installedModulesTable.tenantId, id) as any)
    await this.db.delete(brandingTable).where(eq(brandingTable.tenantId, id) as any)
    await this.db.delete(tenantsTable).where(eq(tenantsTable.id, id) as any)
  }

  static async findBranchById(id: string): Promise<Branch | null> {
    const row = await this.db.query.branches.findFirst({ where: eq(branchesTable.id, id) as any })
    return row ? TenantsMapper.branchToDomain(row as any) : null
  }

  static async listBranches(tenantId: string): Promise<Branch[]> {
    const rows = await this.db.query.branches.findMany({
      where: eq(branchesTable.tenantId, tenantId) as any,
      orderBy: [asc(branchesTable.name)],
    })
    return rows.map((r) => TenantsMapper.branchToDomain(r as any))
  }

  static async saveBranch(branch: Branch): Promise<void> {
    const row = TenantsMapper.branchToPersistence(branch)
    await this.db.insert(branchesTable).values(row as any).onConflictDoUpdate({
      target: branchesTable.id,
      set: row as any,
    })
  }

  static async deleteBranch(tenantId: string, id: string): Promise<void> {
    await this.db.delete(branchesTable).where(
      and(eq(branchesTable.tenantId, tenantId), eq(branchesTable.id, id)) as any,
    )
  }
}
