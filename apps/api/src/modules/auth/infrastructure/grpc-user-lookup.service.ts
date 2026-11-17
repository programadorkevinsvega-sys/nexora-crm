import { Injectable } from '@nestjs/common'
import { UserLookup, UserLookupService } from '../application/commands/auth.handlers'
import { UsersGrpcClient } from '../../../common/grpc/users-grpc.client'

@Injectable()
export class GrpcUserLookupService extends UserLookupService {
  constructor(private readonly usersGrpc: UsersGrpcClient) {
    super()
  }

  async findByTenantAndEmail(tenantId: string, email: string): Promise<UserLookup | null> {
    return this.usersGrpc.findByEmail(tenantId, email)
  }

  async findById(tenantId: string, userId: string): Promise<Pick<UserLookup, 'id' | 'passwordHash'> | null> {
    return this.usersGrpc.findById(tenantId, userId)
  }
}
