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

interface TenantGrpcRequest {
  ownerUserId?: unknown
  industryType?: unknown
  name?: unknown
  legalName?: unknown
  taxId?: unknown
  taxRegime?: unknown
  legalAddress?: unknown
  city?: unknown
  postalCode?: unknown
  timezone?: unknown
  currencyCode?: unknown
  id?: unknown
  status?: unknown
  search?: unknown
  cursor?: unknown
  limit?: unknown
  tenantId?: unknown
  code?: unknown
  address?: unknown
  country?: unknown
  isHeadquarters?: unknown
  isActive?: unknown
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError(`Missing or invalid ${field}`)
  return value
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function optionalNullableString(value: unknown): string | null | undefined {
  return value === null ? null : optionalString(value)
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function pageLimit(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 100 ? value : 20
}

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
  async createTenant(data: TenantGrpcRequest) {
    const result = await this.createTenantHandler.execute(
      new CreateTenantCommand(
        requiredString(data.ownerUserId, 'ownerUserId'),
        requiredString(data.industryType, 'industryType'),
        requiredString(data.name, 'name'),
        optionalString(data.legalName), optionalString(data.taxId), optionalString(data.taxRegime),
        optionalString(data.legalAddress), optionalString(data.city), optionalString(data.postalCode),
        optionalString(data.timezone), optionalString(data.currencyCode),
      ),
    )
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'GetTenant')
  async getTenant(data: { id: string }) {
    const result = await this.getTenantHandler.execute(data.id)
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListTenants')
  async listTenants(data: TenantGrpcRequest) {
    const result = await this.listTenantsHandler.execute(
      new ListTenantsQuery(optionalString(data.search), optionalString(data.status), optionalString(data.cursor), pageLimit(data.limit)),
    )
    return {
      jsonItems: result.data.map((t) => JSON.stringify(TenantsMapper.tenantToResponse(t))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('TenantService', 'UpdateTenant')
  async updateTenant(data: TenantGrpcRequest) {
    const result = await this.updateTenantHandler.execute(
      new UpdateTenantCommand(
        requiredString(data.id, 'id'), optionalString(data.name), optionalNullableString(data.legalName),
        optionalNullableString(data.taxId), optionalNullableString(data.taxRegime),
        optionalNullableString(data.legalAddress), optionalNullableString(data.city),
        optionalNullableString(data.postalCode), optionalString(data.industryType),
        optionalString(data.status), optionalString(data.timezone), optionalString(data.currencyCode),
      ),
    )
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteTenant')
  async deleteTenant(data: { id: string }) {
    await this.deleteTenantHandler.execute(new DeleteTenantCommand(data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateBranch')
  async createBranch(data: TenantGrpcRequest) {
    const result = await this.createBranchHandler.execute(
      new CreateBranchCommand(
        requiredString(data.tenantId, 'tenantId'), requiredString(data.name, 'name'),
        optionalString(data.code), optionalString(data.address), optionalString(data.city),
        optionalString(data.country), optionalBoolean(data.isHeadquarters),
      ),
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
  async updateBranch(data: TenantGrpcRequest) {
    const result = await this.updateBranchHandler.execute(
      new UpdateBranchCommand(
        requiredString(data.tenantId, 'tenantId'), requiredString(data.id, 'id'), optionalString(data.name),
        optionalNullableString(data.code), optionalNullableString(data.address), optionalNullableString(data.city),
        optionalNullableString(data.country), optionalBoolean(data.isActive), optionalBoolean(data.isHeadquarters),
      ),
    )
    return { json: JSON.stringify(TenantsMapper.branchToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteBranch')
  async deleteBranch(data: { tenantId: string; id: string }) {
    await this.deleteBranchHandler.execute(new DeleteBranchCommand(data.tenantId, data.id))
    return {}
  }
}
