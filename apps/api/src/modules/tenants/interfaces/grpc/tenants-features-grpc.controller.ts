/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  UpdateBrandingHandler, ToggleFeatureHandler,
  CreateDomainHandler, DeleteDomainHandler, SetPrimaryDomainHandler,
  UpsertMetricHandler, InstallModuleHandler, UninstallModuleHandler,
} from '../../application/commands/tenants.handlers'
import {
  GetBrandingHandler,
  ListFeaturesHandler, ListDomainsHandler, ListMetricsHandler,
  ListSystemModulesHandler, ListInstalledModulesHandler,
} from '../../application/queries/tenants.handlers'
import {
  UpdateBrandingCommand, ToggleFeatureCommand,
  CreateDomainCommand, DeleteDomainCommand, SetPrimaryDomainCommand,
  UpsertMetricCommand, InstallModuleCommand, UninstallModuleCommand,
} from '../../application/commands/tenants.commands'
import {
  GetBrandingQuery,
  ListFeaturesQuery, ListDomainsQuery, ListMetricsQuery,
  ListSystemModulesQuery, ListInstalledModulesQuery,
} from '../../application/queries/tenants.queries'
import { TenantsMapper } from '../../infrastructure/tenants.mapper'

@Controller()
export class TenantsFeaturesGrpcController {
  constructor(
    private readonly getBrandingHandler: GetBrandingHandler,
    private readonly updateBrandingHandler: UpdateBrandingHandler,
    private readonly listFeaturesHandler: ListFeaturesHandler,
    private readonly toggleFeatureHandler: ToggleFeatureHandler,
    private readonly listDomainsHandler: ListDomainsHandler,
    private readonly createDomainHandler: CreateDomainHandler,
    private readonly deleteDomainHandler: DeleteDomainHandler,
    private readonly setPrimaryDomainHandler: SetPrimaryDomainHandler,
    private readonly listMetricsHandler: ListMetricsHandler,
    private readonly upsertMetricHandler: UpsertMetricHandler,
    private readonly listSystemModulesHandler: ListSystemModulesHandler,
    private readonly listInstalledModulesHandler: ListInstalledModulesHandler,
    private readonly installModuleHandler: InstallModuleHandler,
    private readonly uninstallModuleHandler: UninstallModuleHandler,
  ) {}

  @GrpcMethod('TenantService', 'GetBranding')
  async getBranding(data: { id: string }) {
    const result = await this.getBrandingHandler.execute(new GetBrandingQuery(data.id))
    return { json: JSON.stringify(TenantsMapper.brandingToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'UpdateBranding')
  async updateBranding(data: any) {
    await this.updateBrandingHandler.execute(
      new UpdateBrandingCommand(data.tenantId, data.logoUrl, data.faviconUrl, data.primaryColor, data.secondaryColor, data.customDomain),
    )
    return {}
  }

  @GrpcMethod('TenantService', 'ListFeatures')
  async listFeatures(data: { tenantId: string }) {
    const result = await this.listFeaturesHandler.execute(new ListFeaturesQuery(data.tenantId))
    return { jsonItems: result.map((f) => JSON.stringify(TenantsMapper.featureToResponse(f))) }
  }

  @GrpcMethod('TenantService', 'ToggleFeature')
  async toggleFeature(data: { tenantId: string; featureCode: string; isEnabled: boolean }) {
    await this.toggleFeatureHandler.execute(new ToggleFeatureCommand(data.tenantId, data.featureCode, data.isEnabled))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateDomain')
  async createDomain(data: any) {
    await this.createDomainHandler.execute(new CreateDomainCommand(data.tenantId, data.domain, data.isPrimary))
    return {}
  }

  @GrpcMethod('TenantService', 'ListDomains')
  async listDomains(data: { tenantId: string }) {
    const result = await this.listDomainsHandler.execute(new ListDomainsQuery(data.tenantId))
    return { jsonItems: result.map((d) => JSON.stringify(TenantsMapper.domainToResponse(d))) }
  }

  @GrpcMethod('TenantService', 'DeleteDomain')
  async deleteDomain(data: { tenantId: string; id: string }) {
    await this.deleteDomainHandler.execute(new DeleteDomainCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'SetPrimaryDomain')
  async setPrimaryDomain(data: { tenantId: string; domainId: string }) {
    await this.setPrimaryDomainHandler.execute(new SetPrimaryDomainCommand(data.tenantId, data.domainId))
    return {}
  }

  @GrpcMethod('TenantService', 'ListMetrics')
  async listMetrics(data: { tenantId: string }) {
    const result = await this.listMetricsHandler.execute(new ListMetricsQuery(data.tenantId))
    return { jsonItems: result.map((m) => JSON.stringify(TenantsMapper.metricToResponse(m))) }
  }

  @GrpcMethod('TenantService', 'UpsertMetric')
  async upsertMetric(data: any) {
    const result = await this.upsertMetricHandler.execute(
      new UpsertMetricCommand(data.tenantId, data.metricName, data.currentValue, data.limitValue, data.periodStart ?? new Date().toISOString(), data.periodEnd ?? new Date().toISOString()),
    )
    return { json: JSON.stringify(TenantsMapper.metricToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListSystemModules')
  async listSystemModules(data: { category?: string }) {
    const result = await this.listSystemModulesHandler.execute(new ListSystemModulesQuery(data.category))
    return { jsonItems: result.map((m) => JSON.stringify(TenantsMapper.sysModuleToResponse(m))) }
  }

  @GrpcMethod('TenantService', 'ListInstalledModules')
  async listInstalledModules(data: { tenantId: string }) {
    const result = await this.listInstalledModulesHandler.execute(new ListInstalledModulesQuery(data.tenantId))
    return { jsonItems: result.map((m) => JSON.stringify(TenantsMapper.installedModuleToResponse(m))) }
  }

  @GrpcMethod('TenantService', 'InstallModule')
  async installModule(data: { tenantId: string; moduleId: string }) {
    await this.installModuleHandler.execute(new InstallModuleCommand(data.tenantId, data.moduleId))
    return {}
  }

  @GrpcMethod('TenantService', 'UninstallModule')
  async uninstallModule(data: { tenantId: string; moduleId: string }) {
    await this.uninstallModuleHandler.execute(new UninstallModuleCommand(data.tenantId, data.moduleId))
    return {}
  }
}
