import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { PasswordPolicy } from '../../domain/entities/password-policy.entity'
import {
  GetPasswordPolicyQuery, ListSessionsQuery, ListIpRestrictionsQuery,
  ListOAuthProvidersQuery, VerifyTokenQuery, ListMfaMethodsQuery,
} from './auth.queries'

@Injectable()
export class GetPasswordPolicyHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(query: GetPasswordPolicyQuery) {
    const policy = await this.repo.getPasswordPolicy(query.tenantId)
    if (!policy) return PasswordPolicy.default(query.tenantId)
    return policy
  }
}

@Injectable()
export class ListSessionsHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(query: ListSessionsQuery) {
    return this.repo.listSessionsByUser(query.tenantId, query.userId)
  }
}

@Injectable()
export class ListIpRestrictionsHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(query: ListIpRestrictionsQuery) {
    return this.repo.listIpRestrictions(query.tenantId, query.userId)
  }
}

@Injectable()
export class ListOAuthProvidersHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(query: ListOAuthProvidersQuery) {
    return this.repo.listOAuthProviders(query.tenantId)
  }
}

@Injectable()
export class VerifyTokenHandler {
  constructor(private readonly jwtService: JwtService) {}

  async execute(query: VerifyTokenQuery) {
    try {
      const payload = await this.jwtService.verifyAsync(query.token)
      return {
        valid: true,
        userId: payload.sub,
        tenantId: payload.tenantId,
        email: payload.email,
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}

@Injectable()
export class ListMfaMethodsHandler {
  constructor(private readonly repo: AuthRepository) {}

  async execute(query: ListMfaMethodsQuery) {
    const methods = await this.repo.findMfaMethodsByUser(query.tenantId, query.userId)
    return methods.map((method) => ({
      id: method.id,
      type: method.type,
      isPrimary: method.isPrimary,
      isActive: method.isActive,
      createdAt: method.createdAt.toISOString(),
    }))
  }
}
