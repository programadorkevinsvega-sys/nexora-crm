/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { RegisterHandler } from '../../application/commands/register.handler'
import {
  LoginHandler, RefreshTokenHandler, LogoutHandler, ChangePasswordHandler,
} from '../../application/commands/auth.handlers'
import { VerifyTokenHandler } from '../../application/queries/auth.handlers'
import {
  RegisterCommand,
  LoginCommand, RefreshTokenCommand, LogoutCommand, ChangePasswordCommand,
} from '../../application/commands/auth.commands'
import { VerifyTokenQuery } from '../../application/queries/auth.queries'
import { validateOrThrow } from '../../../../common/validation/validate'
import {
  LoginSchema, ChangePasswordSchema, RefreshTokenSchema,
} from '@crm/contracts'

@Controller()
export class AuthLoginGrpcController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly changePasswordHandler: ChangePasswordHandler,
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
      tenantId: data.tenantId || '00000000-0000-0000-0000-000000000001',
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
}
