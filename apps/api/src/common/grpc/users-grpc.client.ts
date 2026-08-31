/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { UserLookup } from '../../modules/auth/application/commands/auth.handlers'

interface UserGrpcService {
  findByEmail(data: { tenantId: string; email: string }): any
  getById(data: { tenantId: string; id: string }): any
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
      const res: any = await lastValueFrom(
        this.usersService.findByEmail({ tenantId, email }),
      )
      if (!res?.json) return null
      const parsed = JSON.parse(res.json)
      return {
        id: parsed.id,
        email: parsed.email,
        passwordHash: parsed.passwordHash ?? null,
      }
    } catch (error: any) {
      if (error?.details?.includes('not found') || error?.message?.includes('not found')) {
        return null
      }
      this.logger.error(`gRPC findByEmail failed: ${error.message}`)
      return null
    }
  }

  async findById(tenantId: string, userId: string): Promise<Pick<UserLookup, 'id' | 'passwordHash'> | null> {
    try {
      const res: any = await lastValueFrom(
        this.usersService.getById({ tenantId, id: userId }),
      )
      if (!res?.json) return null
      const parsed = JSON.parse(res.json)
      return {
        id: parsed.id,
        passwordHash: parsed.passwordHash ?? null,
      }
    } catch (error: any) {
      if (error?.details?.includes('not found') || error?.message?.includes('not found')) {
        return null
      }
      this.logger.error(`gRPC findById failed: ${error.message}`)
      return null
    }
  }
}
