/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { RegisterHandler } from '../../application/commands/register.handler'
import {
  LoginHandler, RefreshTokenHandler, LogoutHandler, ChangePasswordHandler,
  SetupMfaHandler, VerifyMfaHandler, GetRecoveryCodesHandler, RegenerateRecoveryCodesHandler,
  UpdatePasswordPolicyHandler, CreateIpRestrictionHandler, DeleteIpRestrictionHandler,
  RevokeSessionHandler, CreateOAuthProviderHandler, DeleteOAuthProviderHandler,
} from '../../application/commands/auth.handlers'
import {
  GetPasswordPolicyHandler, ListSessionsHandler, ListIpRestrictionsHandler,
  ListOAuthProvidersHandler, VerifyTokenHandler,
} from '../../application/queries/auth.handlers'
import {
  RegisterCommand,
  LoginCommand, RefreshTokenCommand, LogoutCommand, ChangePasswordCommand,
  SetupMfaCommand, VerifyMfaCommand, GetRecoveryCodesCommand, RegenerateRecoveryCodesCommand,
  UpdatePasswordPolicyCommand, CreateIpRestrictionCommand, DeleteIpRestrictionCommand,
  RevokeSessionCommand, CreateOAuthProviderCommand, DeleteOAuthProviderCommand,
} from '../../application/commands/auth.commands'
import {
  GetPasswordPolicyQuery, ListSessionsQuery, ListIpRestrictionsQuery,
  ListOAuthProvidersQuery, VerifyTokenQuery,
} from '../../application/queries/auth.queries'
import { AuthMapper } from '../../infrastructure/auth.mapper'
import { validateOrThrow } from '../../../../common/validation/validate'
import {
  LoginSchema, SetupMfaSchema, VerifyMfaSchema, ChangePasswordSchema,
  UpdatePasswordPolicySchema, CreateIpRestrictionSchema, CreateOAuthProviderSchema,
  RefreshTokenSchema,
} from '@crm/contracts'

@Controller()
export class AuthGrpcController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly changePasswordHandler: ChangePasswordHandler,
    private readonly setupMfaHandler: SetupMfaHandler,
    private readonly verifyMfaHandler: VerifyMfaHandler,
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
    private readonly verifyTokenHandler: VerifyTokenHandler,
  ) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: any) {
    const result = await this.registerHandler.execute(
      new RegisterCommand(
        data.name,
        data.email,
        data.password,
        data.company,
        data.ipAddress,
        data.userAgent,
      ),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: any) {
    const input = validateOrThrow(LoginSchema, {
      tenantId: data.tenantId,
      email: data.email,
      password: data.password,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      deviceId: data.deviceId,
      mfaCode: data.mfaCode,
    })
    const result = await this.loginHandler.execute(
      new LoginCommand(
        input.tenantId, input.email, input.password,
        input.ipAddress, input.userAgent, input.deviceId, input.mfaCode,
      ),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'VerifyToken')
  async verifyToken(data: { token: string }) {
    const result = await this.verifyTokenHandler.execute(
      new VerifyTokenQuery(data.token),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(data: any) {
    const input = validateOrThrow(RefreshTokenSchema, {
      tenantId: data.tenantId,
      refreshToken: data.refreshToken,
    })
    const result = await this.refreshTokenHandler.execute(
      new RefreshTokenCommand(input.tenantId, input.refreshToken),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('AuthService', 'Logout')
  async logout(data: { tenantId: string; sessionId: string }) {
    await this.logoutHandler.execute(
      new LogoutCommand(data.tenantId, data.sessionId),
    )
    return {}
  }

  @GrpcMethod('AuthService', 'ChangePassword')
  async changePassword(data: any) {
    const input = validateOrThrow(ChangePasswordSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    await this.changePasswordHandler.execute(
      new ChangePasswordCommand(
        input.tenantId, input.userId,
        input.currentPassword, input.newPassword,
      ),
    )
    return {}
  }

  @GrpcMethod('AuthService', 'SetupMfa')
  async setupMfa(data: any) {
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
  async verifyMfa(data: any) {
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
  async updatePasswordPolicy(data: any) {
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
      jsonItems: sessions.map(s => JSON.stringify(AuthMapper.sessionToResponse(s))),
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
  async createIpRestriction(data: any) {
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
      jsonItems: restrictions.map(r => JSON.stringify(AuthMapper.ipRestrictionToResponse(r))),
    }
  }

  @GrpcMethod('AuthService', 'CreateOAuthProvider')
  async createOAuthProvider(data: any) {
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
      jsonItems: providers.map(p => JSON.stringify(AuthMapper.oauthProviderToResponse(p))),
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
