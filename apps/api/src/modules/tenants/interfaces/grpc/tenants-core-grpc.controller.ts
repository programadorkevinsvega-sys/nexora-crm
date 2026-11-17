/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateTenantHandler, UpdateTenantHandler, DeleteTenantHandler,
  CreateBranchHandler, UpdateBranchHandler, DeleteBranchHandler,
} from '../../application/commands/tenants.handlers'
import {
  GetTenantHandler, GetBranchHandler,
  ListTenantsHandler, ListBranchesHandler,
} from '../../application/queries/tenants.handlers'
import {
  CreateTenantCommand, UpdateTenantCommand, DeleteTenantCommand,
  CreateBranchCommand, UpdateBranchCommand, DeleteBranchCommand,
} from '../../application/commands/tenants.commands'
import {
  ListTenantsQuery, ListBranchesQuery,
} from '../../application/queries/tenants.queries'
import { TenantsMapper } from '../../infrastructure/tenants.mapper'

@Controller()
export class TenantsCoreGrpcController {
  constructor(
    private readonly getTenantHandler: GetTenantHandler,
    private readonly createTenantHandler: CreateTenantHandler,
    private readonly updateTenantHandler: UpdateTenantHandler,
    private readonly deleteTenantHandler: DeleteTenantHandler,
    private readonly listTenantsHandler: ListTenantsHandler,
    private readonly createBranchHandler: CreateBranchHandler,
    private readonly getBranchHandler: GetBranchHandler,
    private readonly listBranchesHandler: ListBranchesHandler,
    private readonly updateBranchHandler: UpdateBranchHandler,
    private readonly deleteBranchHandler: DeleteBranchHandler,
  ) {}

  @GrpcMethod('TenantService', 'CreateTenant')
  async createTenant(data: any) {
    const result = await this.createTenantHandler.execute(
      new CreateTenantCommand(data.ownerUserId, data.industryType, data.name,
        data.legalName, data.taxId, data.taxRegime, data.legalAddress,
        data.city, data.postalCode, data.timezone, data.currencyCode),
    )
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'GetTenant')
  async getTenant(data: { id: string }) {
    const result = await this.getTenantHandler.execute(data.id)
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListTenants')
  async listTenants(data: any) {
    const result = await this.listTenantsHandler.execute(
      new ListTenantsQuery(data.search, data.status, data.cursor, data.limit ?? 20),
    )
    return {
      jsonItems: result.data.map((t) => JSON.stringify(TenantsMapper.tenantToResponse(t))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('TenantService', 'UpdateTenant')
  async updateTenant(data: any) {
    const result = await this.updateTenantHandler.execute(
      new UpdateTenantCommand(data.id, data.name, data.legalName, data.taxId, data.taxRegime,
        data.legalAddress, data.city, data.postalCode, data.industryType,
        data.status, data.timezone, data.currencyCode),
    )
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteTenant')
  async deleteTenant(data: { id: string }) {
    await this.deleteTenantHandler.execute(new DeleteTenantCommand(data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateBranch')
  async createBranch(data: any) {
    const result = await this.createBranchHandler.execute(
      new CreateBranchCommand(data.tenantId, data.name, data.code, data.address, data.city, data.country, data.isHeadquarters),
    )
    return { json: JSON.stringify(TenantsMapper.branchToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'GetBranch')
  async getBranch(data: { id: string }) {
    const result = await this.getBranchHandler.execute(data.id)
    return { json: JSON.stringify(TenantsMapper.branchToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListBranches')
  async listBranches(data: { tenantId: string }) {
    const result = await this.listBranchesHandler.execute(new ListBranchesQuery(data.tenantId))
    return { jsonItems: result.map((b) => JSON.stringify(TenantsMapper.branchToResponse(b))) }
  }

  @GrpcMethod('TenantService', 'UpdateBranch')
  async updateBranch(data: any) {
    const result = await this.updateBranchHandler.execute(
      new UpdateBranchCommand(data.tenantId, data.id, data.name, data.code, data.address, data.city, data.country, data.isActive, data.isHeadquarters),
    )
    return { json: JSON.stringify(TenantsMapper.branchToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteBranch')
  async deleteBranch(data: { tenantId: string; id: string }) {
    await this.deleteBranchHandler.execute(new DeleteBranchCommand(data.tenantId, data.id))
    return {}
  }
}
