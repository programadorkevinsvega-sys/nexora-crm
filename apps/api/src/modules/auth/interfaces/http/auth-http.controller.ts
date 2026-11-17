import { Body, Controller, Ip, Post, Req } from '@nestjs/common'
import { z } from 'zod'
import type { Request } from 'express'
import { validateOrThrow } from '../../../../common/validation/validate'
import {
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
} from '../../application/commands/auth.handlers'
import {
  LoginCommand,
  LogoutCommand,
  RefreshTokenCommand,
} from '../../application/commands/auth.commands'
import { VerifyTokenHandler } from '../../application/queries/auth.handlers'
import { VerifyTokenQuery } from '../../application/queries/auth.queries'
import { LoginSchema, RefreshTokenSchema } from '@crm/contracts'

const LogoutSchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().uuid(),
})

const VerifyTokenSchema = z.object({
  token: z.string().min(1),
})

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

@Controller('auth')
export class AuthHttpController {
  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly verifyTokenHandler: VerifyTokenHandler,
  ) {}

  @Post('login')
  async login(
    @Body() body: unknown,
    @Ip() ip: string,
    @Req() request: Request,
  ) {
    const raw = asRecord(body)
    const userAgentHeader = request.headers['user-agent']
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader

    const input = validateOrThrow(LoginSchema, {
      tenantId: raw.tenantId,
      email: raw.email,
      password: raw.password,
      ipAddress: raw.ipAddress ?? ip,
      userAgent: raw.userAgent ?? userAgent,
      deviceId: raw.deviceId,
      mfaCode: raw.mfaCode,
    })

    return this.loginHandler.execute(
      new LoginCommand(
        input.tenantId,
        input.email,
        input.password,
        input.ipAddress,
        input.userAgent,
        input.deviceId,
        input.mfaCode,
      ),
    )
  }

  @Post('refresh')
  async refresh(@Body() body: unknown) {
    const raw = asRecord(body)
    const input = validateOrThrow(RefreshTokenSchema, {
      tenantId: raw.tenantId,
      refreshToken: raw.refreshToken,
    })

    return this.refreshTokenHandler.execute(
      new RefreshTokenCommand(input.tenantId, input.refreshToken),
    )
  }

  @Post('logout')
  async logout(@Body() body: unknown) {
    const raw = asRecord(body)
    const input = validateOrThrow(LogoutSchema, {
      tenantId: raw.tenantId,
      sessionId: raw.sessionId,
    })

    await this.logoutHandler.execute(
      new LogoutCommand(input.tenantId, input.sessionId),
    )

    return { ok: true }
  }

  @Post('verify-token')
  async verifyToken(@Body() body: unknown) {
    const raw = asRecord(body)
    const input = validateOrThrow(VerifyTokenSchema, {
      token: raw.token,
    })

    return this.verifyTokenHandler.execute(
      new VerifyTokenQuery(input.token),
    )
  }
}
