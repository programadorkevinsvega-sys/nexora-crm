import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom, Observable } from 'rxjs'

interface IamGrpcService {
  checkPermission(data: { tenantId: string; userId: string; module: string; action: string; branchId?: string }): Observable<{ allowed: boolean }>
  getUserRoles(data: { tenantId: string; userId: string }): Observable<{ jsonItems: string[]; nextCursor?: string }>
}

export interface IamUserRole {
  userId: string
  roleId: string
  tenantId: string
  branchId: string | null
  grantedAt: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseUserRole(json: string): IamUserRole | null {
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    return null
  }
  if (!isRecord(value)
    || typeof value.userId !== 'string'
    || typeof value.roleId !== 'string'
    || typeof value.tenantId !== 'string'
    || typeof value.grantedAt !== 'string') return null
  return {
    userId: value.userId,
    roleId: value.roleId,
    tenantId: value.tenantId,
    branchId: typeof value.branchId === 'string' ? value.branchId : null,
    grantedAt: value.grantedAt,
  }
}

@Injectable()
export class IamGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(IamGrpcClient.name)
  private service!: IamGrpcService

  constructor(@Inject('IAM_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.service = this.client.getService<IamGrpcService>('IamService')
  }

  async checkPermission(tenantId: string, userId: string, permission: string): Promise<{ allowed: boolean }> {
    const separator = permission.lastIndexOf('.')
    if (separator <= 0 || separator === permission.length - 1) return { allowed: false }
    const module = permission.slice(0, separator)
    const action = permission.slice(separator + 1)
    try {
      const response = await lastValueFrom(this.service.checkPermission({ tenantId, userId, module, action }))
      return { allowed: response?.allowed === true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.warn(`gRPC permission check failed: ${message}`)
      return { allowed: false }
    }
  }

  async getUserRoles(tenantId: string, userId: string): Promise<IamUserRole[]> {
    try {
      const response = await lastValueFrom(this.service.getUserRoles({ tenantId, userId }))
      return response?.jsonItems?.flatMap((json) => {
        const role = parseUserRole(json)
        return role ? [role] : []
      }) ?? []
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.warn(`gRPC user role lookup failed: ${message}`)
      return []
    }
  }
}
