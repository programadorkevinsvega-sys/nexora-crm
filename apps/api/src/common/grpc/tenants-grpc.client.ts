import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom, Observable } from 'rxjs'
import { TenantStatus } from '@crm/contracts'

interface TenantGrpcService {
  getById(data: { id: string }): Observable<{ json: string }>
}

export interface TenantGrpcResponse extends Record<string, unknown> {
  id: string
  name: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL'
  isActive?: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseTenantResponse(json: string): TenantGrpcResponse | null {
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    return null
  }
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null
  const status = TenantStatus.safeParse(value.status)
  return {
    ...value,
    id: value.id,
    name: value.name,
    ...(status.success ? { status: status.data } : {}),
    ...(typeof value.isActive === 'boolean' ? { isActive: value.isActive } : {}),
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

@Injectable()
export class TenantsGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(TenantsGrpcClient.name)
  private service!: TenantGrpcService

  constructor(@Inject('TENANTS_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.service = this.client.getService<TenantGrpcService>('TenantService')
  }

  async getById(id: string): Promise<TenantGrpcResponse | null> {
    try {
      const response = await lastValueFrom(this.service.getById({ id }))
      return response?.json ? parseTenantResponse(response.json) : null
    } catch (error: unknown) {
      this.logger.error(`gRPC tenant getById failed: ${errorMessage(error)}`)
      return null
    }
  }

  async validateTenant(tenantId: string): Promise<boolean> {
    const tenant = await this.getById(tenantId)
    if (!tenant) return false
    if (tenant.isActive !== undefined) return tenant.isActive
    return tenant.status === 'ACTIVE' || tenant.status === 'TRIAL'
  }
}
