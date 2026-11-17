import { Injectable, NotFoundException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { Tenant } from '../../domain/entities/tenant.entity'
import { Branch } from '../../domain/entities/branch.entity'
import { TenantBranding } from '../../domain/entities/branding.entity'
import { TenantFeature, TenantDomain, UsageMetric } from '../../domain/entities/features.entity'
import { SystemModule, InstalledModule } from '../../domain/entities/modules.entity'
import {
  ListTenantsQuery, GetBrandingQuery, ListBranchesQuery,
  ListFeaturesQuery, ListDomainsQuery, ListMetricsQuery,
  ListSystemModulesQuery, ListInstalledModulesQuery,
} from './tenants.queries'

@Injectable()
export class GetTenantHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(id: string): Promise<Tenant> {
    const tenant = await this.repo.findTenantById(id)
    if (!tenant) throw new NotFoundException('Tenant not found')
    return tenant
  }
}

export class GetBranchHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(id: string): Promise<Branch> {
    const branch = await this.repo.findBranchById(id)
    if (!branch) throw new NotFoundException('Branch not found')
    return branch
  }
}

export class ListTenantsHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(query: ListTenantsQuery) {
    return this.repo.listTenants(query.search, query.status, query.cursor, query.limit)
  }
}

@Injectable()
export class GetBrandingHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(query: GetBrandingQuery): Promise<TenantBranding> {
    const branding = await this.repo.findBranding(query.tenantId)
    if (!branding) throw new NotFoundException('Branding not found')
    return branding
  }
}

@Injectable()
export class ListBranchesHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(query: ListBranchesQuery): Promise<Branch[]> {
    return this.repo.listBranches(query.tenantId)
  }
}

@Injectable()
export class ListFeaturesHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(query: ListFeaturesQuery): Promise<TenantFeature[]> {
    return this.repo.listFeatures(query.tenantId)
  }
}

@Injectable()
export class ListDomainsHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(query: ListDomainsQuery): Promise<TenantDomain[]> {
    return this.repo.listDomains(query.tenantId)
  }
}

@Injectable()
export class ListMetricsHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(query: ListMetricsQuery): Promise<UsageMetric[]> {
    return this.repo.listMetrics(query.tenantId)
  }
}

@Injectable()
export class ListSystemModulesHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(query: ListSystemModulesQuery): Promise<SystemModule[]> {
    return this.repo.listSystemModules(query.category)
  }
}

@Injectable()
export class ListInstalledModulesHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(query: ListInstalledModulesQuery): Promise<InstalledModule[]> {
    return this.repo.listInstalledModules(query.tenantId)
  }
}
