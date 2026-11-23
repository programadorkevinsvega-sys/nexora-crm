import {
  Controller,
  Post,
  Get,
  Body,
  Ip,
  Req,
  Inject,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { ClientGrpc } from '@nestjs/microservices'
import { Observable, lastValueFrom } from 'rxjs'
import { Request } from 'express'
import { Public } from '../../common/decorators/public.decorator'
import { Throttle } from '../../common/decorators/throttle.decorator'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'

interface AuthRequestBody {
  name?: string; email?: string; password?: string; company?: string; companyName?: string
  tenantId?: string; ipAddress?: string; userAgent?: string; deviceId?: string; mfaCode?: string
  refreshToken?: string; sessionId?: string
}
function errorDetails(error: unknown): { message: string; status: number } {
  const candidate = typeof error === 'object' && error !== null
    ? error as { message?: unknown; status?: unknown } : {}
  return {
    message: error instanceof Error ? error.message
      : typeof candidate.message === 'string' ? candidate.message : 'Authentication request failed',
    status: typeof candidate.status === 'number' ? candidate.status : HttpStatus.UNAUTHORIZED,
  }
}
function parseResponse(json: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(json)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new HttpException('Invalid authentication service response', HttpStatus.BAD_GATEWAY)
  }
  return parsed as Record<string, unknown>
}
function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}
interface GrpcAuthService {
  register(data: Record<string, unknown>): Observable<{ json: string }>
  login(data: Record<string, unknown>): Observable<{ json: string }>
  verifyToken(data: { token: string }): Observable<{ json: string }>
  refreshToken(data: Record<string, unknown>): Observable<{ json: string }>
  logout(data: { tenantId: string; sessionId: string }): Observable<{ success: boolean }>
  setupMfa(data: { tenantId: string; userId: string; type: string }): Observable<{ json: string }>
  verifyMfa(data: { tenantId: string; userId: string; code: string; methodId: string }): Observable<{ json: string }>
  disableMfa(data: { tenantId: string; userId: string; code: string; methodId: string }): Observable<{ json: string }>
  listMfaMethods(data: { tenantId: string; userId: string }): Observable<{ jsonItems: string[] }>
}

@ApiTags('Autenticación (Auth & JWT)')
@Throttle({ limit: 10, ttl: 60 })
@Controller('api/auth')
export class AuthBffController implements OnModuleInit {
  private grpcService!: GrpcAuthService

  constructor(@Inject('AUTH_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.grpcService = this.client.getService<GrpcAuthService>('AuthService')
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo inquilino/empresa y usuario administrador' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password', 'company'],
      properties: {
        name: { type: 'string', example: 'Juan Pérez' },
        email: { type: 'string', example: 'juan@miempresa.com' },
        password: { type: 'string', example: 'Password123!' },
        company: { type: 'string', example: 'Mi Empresa SAS' },
      },
    },
  })
  async register(@Body() body: AuthRequestBody, @Ip() ip: string, @Req() request: Request) {
    const userAgentHeader = request.headers['user-agent']
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader
    try {
      const result = await lastValueFrom(
        this.grpcService.register({
          name: body.name,
          email: body.email,
          password: body.password,
          company: body.company || body.companyName,
          ipAddress: body.ipAddress ?? ip,
          userAgent: body.userAgent ?? userAgent,
        })
      )
      const parsed = parseResponse(result.json)
      return {
        ...parsed,
        token: parsed.accessToken || parsed.token,
        accessToken: parsed.accessToken || parsed.token,
        tenantId: asRecord(parsed.user).tenantId || parsed.tenantId,
        userId: asRecord(parsed.user).id || parsed.userId,
        userName: asRecord(parsed.user).name,
        userEmail: asRecord(parsed.user).email,
        companyName: asRecord(parsed.user).companyName,
      }
    } catch (error: unknown) {
      const details = errorDetails(error)
      throw new HttpException(details.message || 'Error al registrar el usuario y empresa', details.status || HttpStatus.CONFLICT)
    }
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener tokens JWT de acceso y refresco' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'demo@nexoracrm.com' },
        password: { type: 'string', example: 'Password123!' },
        tenantId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
      },
    },
  })
  async login(@Body() body: AuthRequestBody, @Ip() ip: string, @Req() request: Request) {
    const userAgentHeader = request.headers['user-agent']
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader
    try {
      const tenantId = body.tenantId || (request.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000001'
      const result = await lastValueFrom(this.grpcService.login({
        tenantId,
        email: body.email,
        password: body.password,
        ipAddress: body.ipAddress ?? ip,
        userAgent: body.userAgent ?? userAgent,
        deviceId: body.deviceId,
        mfaCode: body.mfaCode,
      }))
      const parsed = parseResponse(result.json)
      return {
        ...parsed,
        token: parsed.accessToken || parsed.token,
        accessToken: parsed.accessToken || parsed.token,
        tenantId: asRecord(parsed.user).tenantId || parsed.tenantId,
        userId: asRecord(parsed.user).id || parsed.userId,
        userName: asRecord(parsed.user).name,
        userEmail: asRecord(parsed.user).email,
        companyName: asRecord(parsed.user).companyName,
      }
    } catch (error: unknown) {
      const details = errorDetails(error)
      throw new HttpException(details.message || 'Authentication failed', details.status || HttpStatus.UNAUTHORIZED)
    }
  }

  @Get('mfa/methods')
  @ApiOperation({ summary: 'Listar métodos MFA de la sesión autenticada sin revelar secretos' })
  async listMfaMethods(@CurrentUser() user: AuthenticatedUser) {
    if (!user?.tenantId || !user.userId) {
      throw new HttpException('Authenticated user context is required', HttpStatus.UNAUTHORIZED)
    }
    const result = await lastValueFrom(this.grpcService.listMfaMethods({
      tenantId: user.tenantId,
      userId: user.userId,
    }))
    return result.jsonItems.map((item) => JSON.parse(item))
  }

  @Post('mfa/setup')
  @ApiOperation({ summary: 'Iniciar enrolamiento TOTP para el usuario autenticado' })
  async setupMfa(@CurrentUser() user: AuthenticatedUser) {
    if (!user?.tenantId || !user.userId) {
      throw new HttpException('Authenticated user context is required', HttpStatus.UNAUTHORIZED)
    }
    const result = await lastValueFrom(this.grpcService.setupMfa({
      tenantId: user.tenantId,
      userId: user.userId,
      type: 'TOTP',
    }))
    return JSON.parse(result.json)
  }

  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verificar el código TOTP y activar el método MFA' })
  @ApiBody({ schema: { type: 'object', required: ['methodId', 'code'], properties: {
    methodId: { type: 'string', format: 'uuid' },
    code: { type: 'string', minLength: 6, maxLength: 6 },
  } } })
  async verifyMfa(
    @Body() body: { methodId: string; code: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user?.tenantId || !user.userId) {
      throw new HttpException('Authenticated user context is required', HttpStatus.UNAUTHORIZED)
    }
    const result = await lastValueFrom(this.grpcService.verifyMfa({
      tenantId: user.tenantId,
      userId: user.userId,
      methodId: body.methodId,
      code: body.code,
    }))
    return JSON.parse(result.json)
  }

  @Post('mfa/disable')
  @ApiOperation({ summary: 'Desactivar MFA con prueba TOTP reciente' })
  @ApiBody({ schema: { type: 'object', required: ['methodId', 'code'], properties: {
    methodId: { type: 'string', format: 'uuid' },
    code: { type: 'string', minLength: 6, maxLength: 6 },
  } } })
  async disableMfa(
    @Body() body: { methodId: string; code: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user?.tenantId || !user.userId) {
      throw new HttpException('Authenticated user context is required', HttpStatus.UNAUTHORIZED)
    }
    const result = await lastValueFrom(this.grpcService.disableMfa({
      tenantId: user.tenantId,
      userId: user.userId,
      methodId: body.methodId,
      code: body.code,
    }))
    return JSON.parse(result.json)
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar token de acceso expirado' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: { refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' } },
    },
  })
  async refresh(@Body() body: AuthRequestBody, @Req() request: Request) {
    try {
      const tenantId = body.tenantId || (request.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000001'
      const result = await lastValueFrom(this.grpcService.refreshToken({ tenantId, refreshToken: body.refreshToken }))
      const parsed = parseResponse(result.json)
      return {
        ...parsed,
        token: parsed.accessToken || parsed.token,
        accessToken: parsed.accessToken || parsed.token,
      }
    } catch (error: unknown) {
      const details = errorDetails(error)
      throw new HttpException(details.message || 'Refresh token failed', details.status || HttpStatus.UNAUTHORIZED)
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión e invalidar tokens' })
  @ApiBody({ schema: { type: 'object', properties: { sessionId: { type: 'string', example: 'sess_12345' } } } })
  async logout(@Body() body: AuthRequestBody) {
    if (!body.sessionId) throw new HttpException('Session ID is required', HttpStatus.BAD_REQUEST)
    try {
      await lastValueFrom(this.grpcService.logout({
        tenantId: body.tenantId || '00000000-0000-0000-0000-000000000001',
        sessionId: body.sessionId,
      }))
      return { ok: true }
    } catch (error: unknown) {
      const details = errorDetails(error)
      throw new HttpException(details.message || 'Logout failed', details.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
