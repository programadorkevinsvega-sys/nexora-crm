import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom, Observable } from 'rxjs'
import { UserLookup } from '../../modules/auth/application/commands/auth.handlers'

interface UserGrpcResponse { json?: string }

interface UserGrpcService {
  findByEmail(data: { tenantId: string; email: string }): Observable<UserGrpcResponse>
  getById(data: { tenantId: string; id: string }): Observable<UserGrpcResponse>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isNotFoundError(error: unknown): boolean {
  if (error instanceof Error && error.message.toLowerCase().includes('not found')) return true
  if (!isRecord(error)) return false
  const details = error.details
  return typeof details === 'string' && details.toLowerCase().includes('not found')
}

@Injectable()
export class UsersGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(UsersGrpcClient.name)
  private usersService!: UserGrpcService

  constructor(@Inject('USERS_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.usersService = this.client.getService<UserGrpcService>('UserService')
    this.logger.log('Users gRPC client initialized')
  }

  async findByEmail(tenantId: string, email: string): Promise<UserLookup | null> {
    try {
      const res = await lastValueFrom(
        this.usersService.findByEmail({ tenantId, email }),
      )
      if (!res?.json) return null
      const parsed: unknown = JSON.parse(res.json)
      if (!isRecord(parsed) || typeof parsed.id !== 'string' || typeof parsed.email !== 'string') return null
      return {
        id: parsed.id,
        email: parsed.email,
        passwordHash: typeof parsed.passwordHash === 'string' ? parsed.passwordHash : null,
      }
    } catch (error: unknown) {
      if (isNotFoundError(error)) return null
      this.logger.error(`gRPC findByEmail failed: ${getErrorMessage(error)}`)
      return null
    }
  }

  async findById(tenantId: string, userId: string): Promise<Pick<UserLookup, 'id' | 'passwordHash'> | null> {
    try {
      const res: any = await lastValueFrom(
        this.usersService.getById({ tenantId, id: userId }),
      )
      if (!res?.json) return null
      const parsed: unknown = JSON.parse(res.json)
      if (!isRecord(parsed) || typeof parsed.id !== 'string') return null
      return {
        id: parsed.id,
        passwordHash: typeof parsed.passwordHash === 'string' ? parsed.passwordHash : null,
      }
    } catch (error: unknown) {
      if (isNotFoundError(error)) return null
      this.logger.error(`gRPC findById failed: ${getErrorMessage(error)}`)
      return null
    }
  }
}
