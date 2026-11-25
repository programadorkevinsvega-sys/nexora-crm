import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  SetupMfaHandler, VerifyMfaHandler, DisableMfaHandler, GetRecoveryCodesHandler, RegenerateRecoveryCodesHandler,
  UpdatePasswordPolicyHandler, CreateIpRestrictionHandler, DeleteIpRestrictionHandler,
  RevokeSessionHandler, CreateOAuthProviderHandler, DeleteOAuthProviderHandler,
} from '../../application/commands/auth.handlers'
import {
  GetPasswordPolicyHandler, ListSessionsHandler, ListIpRestrictionsHandler,
  ListOAuthProvidersHandler, ListMfaMethodsHandler,
} from '../../application/queries/auth.handlers'
import {
  SetupMfaCommand, VerifyMfaCommand, GetRecoveryCodesCommand, RegenerateRecoveryCodesCommand,
  UpdatePasswordPolicyCommand, CreateIpRestrictionCommand, DeleteIpRestrictionCommand,
  RevokeSessionCommand, CreateOAuthProviderCommand, DeleteOAuthProviderCommand,
} from '../../application/commands/auth.commands'
import {
  GetPasswordPolicyQuery, ListSessionsQuery, ListIpRestrictionsQuery,
  ListOAuthProvidersQuery, ListMfaMethodsQuery,
} from '../../application/queries/auth.queries'
import { AuthMapper } from '../../infrastructure/auth.mapper'
import { validateOrThrow } from '../../../../common/validation/validate'
import {
  SetupMfaSchema, VerifyMfaSchema,
  UpdatePasswordPolicySchema, CreateIpRestrictionSchema, CreateOAuthProviderSchema,
} from '@crm/contracts'

interface SetupMfaRequest {
  tenantId: string
  userId: string
  type: string
  phone?: string
  email?: string
}

interface VerifyMfaRequest {
  tenantId: string
  userId: string
  code: string
  methodId: string
}

interface UpdatePasswordPolicyRequest {
  tenantId: string
  minLength?: number
  requireUppercase?: boolean
  requireNumbers?: boolean
  requireSymbols?: boolean
  expireDays?: number
  preventReuseLastN?: number
}

interface CreateIpRestrictionRequest {
  tenantId: string
  userId?: string
  ipAddress: string
  type: string
  description?: string
}

interface CreateOAuthProviderRequest {
  tenantId: string
  providerName: string
  clientId: string
  clientSecret: string
}

@Controller()
export class AuthMfaSecurityGrpcController {
  constructor(
    private readonly setupMfaHandler: SetupMfaHandler,
    private readonly verifyMfaHandler: VerifyMfaHandler,
    private readonly disableMfaHandler: DisableMfaHandler,
    private readonly listMfaMethodsHandler: ListMfaMethodsHandler,
    private readonly getRecoveryCodesHandler: GetRecoveryCodesHandler,
    private readonly regenerateRecoveryCodesHandler: RegenerateRecoveryCodesHandler,
    private readonly getPasswordPolicyHandler: GetPasswordPolicyHandler,
    private readonly updatePasswordPolicyHandler: UpdatePasswordPolicyHandler,
    private readonly listSessionsHandler: ListSessionsHandler,
    private readonly revokeSessionHandler: RevokeSessionHandler,
    private readonly createIpRestrictionHandler: CreateIpRestrictionHandler,
    private readonly deleteIpRestrictionHandler: DeleteIpRestrictionHandler,
    private readonly listIpRestrictionsHandler: ListIpRestrictionsHandler,
    private readonly createOAuthProviderHandler: CreateOAuthProviderHandler,
    private readonly deleteOAuthProviderHandler: DeleteOAuthProviderHandler,
    private readonly listOAuthProvidersHandler: ListOAuthProvidersHandler,
  ) {}

  @GrpcMethod('AuthService', 'SetupMfa')
  async setupMfa(data: SetupMfaRequest) {
    const input = validateOrThrow(SetupMfaSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      type: data.type,
      phone: data.phone,
      email: data.email,
    })
    const result = await this.setupMfaHandler.execute(
      new SetupMfaCommand(input.tenantId, input.userId, input.type, input.phone, input.email),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'VerifyMfa')
  async verifyMfa(data: VerifyMfaRequest) {
    const input = validateOrThrow(VerifyMfaSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      code: data.code,
      methodId: data.methodId,
    })
    const result = await this.verifyMfaHandler.execute(
      new VerifyMfaCommand(input.tenantId, input.userId, input.code, input.methodId),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'DisableMfa')
  async disableMfa(data: VerifyMfaRequest) {
    const input = validateOrThrow(VerifyMfaSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      code: data.code,
      methodId: data.methodId,
    })
    const result = await this.disableMfaHandler.execute(
      new VerifyMfaCommand(input.tenantId, input.userId, input.code, input.methodId),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'ListMfaMethods')
  async listMfaMethods(data: { tenantId: string; userId: string }) {
    const methods = await this.listMfaMethodsHandler.execute(
      new ListMfaMethodsQuery(data.tenantId, data.userId),
    )
    return { jsonItems: methods.map((method) => JSON.stringify(method)) }
  }

  @GrpcMethod('AuthService', 'GetRecoveryCodes')
  async getRecoveryCodes(data: { tenantId: string; userId: string }) {
    const result = await this.getRecoveryCodesHandler.execute(
      new GetRecoveryCodesCommand(data.tenantId, data.userId),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'RegenerateRecoveryCodes')
  async regenerateRecoveryCodes(data: { tenantId: string; userId: string }) {
    const result = await this.regenerateRecoveryCodesHandler.execute(
      new RegenerateRecoveryCodesCommand(data.tenantId, data.userId),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'GetPasswordPolicy')
  async getPasswordPolicy(data: { tenantId: string }) {
    const policy = await this.getPasswordPolicyHandler.execute(
      new GetPasswordPolicyQuery(data.tenantId),
    )
    return { json: JSON.stringify(AuthMapper.passwordPolicyToResponse(policy)) }
  }

  @GrpcMethod('AuthService', 'UpdatePasswordPolicy')
  async updatePasswordPolicy(data: UpdatePasswordPolicyRequest) {
    const input = validateOrThrow(UpdatePasswordPolicySchema, {
      tenantId: data.tenantId,
      minLength: data.minLength,
      requireUppercase: data.requireUppercase,
      requireNumbers: data.requireNumbers,
      requireSymbols: data.requireSymbols,
      expireDays: data.expireDays,
      preventReuseLastN: data.preventReuseLastN,
    })
    await this.updatePasswordPolicyHandler.execute(
      new UpdatePasswordPolicyCommand(
        input.tenantId, input.minLength, input.requireUppercase,
        input.requireNumbers, input.requireSymbols,
        input.expireDays, input.preventReuseLastN,
      ),
    )
    return {}
  }

  @GrpcMethod('AuthService', 'ListSessions')
  async listSessions(data: { tenantId: string; userId: string }) {
    const sessions = await this.listSessionsHandler.execute(
      new ListSessionsQuery(data.tenantId, data.userId),
    )
    return {
      jsonItems: sessions.map((s) => JSON.stringify(AuthMapper.sessionToResponse(s))),
    }
  }

  @GrpcMethod('AuthService', 'RevokeSession')
  async revokeSession(data: { tenantId: string; sessionId: string }) {
    await this.revokeSessionHandler.execute(
      new RevokeSessionCommand(data.tenantId, data.sessionId),
    )
    return {}
  }

  @GrpcMethod('AuthService', 'CreateIpRestriction')
  async createIpRestriction(data: CreateIpRestrictionRequest) {
    const input = validateOrThrow(CreateIpRestrictionSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      ipAddress: data.ipAddress,
      type: data.type,
      description: data.description,
    })
    const result = await this.createIpRestrictionHandler.execute(
      new CreateIpRestrictionCommand(
        input.tenantId, input.ipAddress, input.type,
        input.userId ?? undefined, input.description,
      ),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'DeleteIpRestriction')
  async deleteIpRestriction(data: { tenantId: string; id: string }) {
    await this.deleteIpRestrictionHandler.execute(
      new DeleteIpRestrictionCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('AuthService', 'ListIpRestrictions')
  async listIpRestrictions(data: { tenantId: string; userId?: string }) {
    const restrictions = await this.listIpRestrictionsHandler.execute(
      new ListIpRestrictionsQuery(data.tenantId, data.userId),
    )
    return {
      jsonItems: restrictions.map((r) => JSON.stringify(AuthMapper.ipRestrictionToResponse(r))),
    }
  }

  @GrpcMethod('AuthService', 'CreateOAuthProvider')
  async createOAuthProvider(data: CreateOAuthProviderRequest) {
    const input = validateOrThrow(CreateOAuthProviderSchema, {
      tenantId: data.tenantId,
      providerName: data.providerName,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
    })
    const result = await this.createOAuthProviderHandler.execute(
      new CreateOAuthProviderCommand(
        input.tenantId, input.providerName, input.clientId, input.clientSecret,
      ),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'ListOAuthProviders')
  async listOAuthProviders(data: { tenantId: string }) {
    const providers = await this.listOAuthProvidersHandler.execute(
      new ListOAuthProvidersQuery(data.tenantId),
    )
    return {
      jsonItems: providers.map((p) => JSON.stringify(AuthMapper.oauthProviderToResponse(p))),
    }
  }

  @GrpcMethod('AuthService', 'DeleteOAuthProvider')
  async deleteOAuthProvider(data: { tenantId: string; id: string }) {
    await this.deleteOAuthProviderHandler.execute(
      new DeleteOAuthProviderCommand(data.tenantId, data.id),
    )
    return {}
  }
}
