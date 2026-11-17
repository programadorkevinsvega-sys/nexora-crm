import {
  Controller,
  Post,
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

interface GrpcAuthService {
  register(data: any): Observable<{ json: string }>
  login(data: any): Observable<{ json: string }>
  verifyToken(data: { token: string }): Observable<{ json: string }>
  refreshToken(data: any): Observable<{ json: string }>
  logout(data: { tenantId: string; sessionId: string }): Observable<any>
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
  async register(@Body() body: any, @Ip() ip: string, @Req() request: Request) {
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
      const parsed = JSON.parse(result.json)
      return {
        ...parsed,
        token: parsed.accessToken || parsed.token,
        accessToken: parsed.accessToken || parsed.token,
        tenantId: parsed.user?.tenantId || parsed.tenantId,
        userId: parsed.user?.id || parsed.userId,
        userName: parsed.user?.name,
        userEmail: parsed.user?.email,
        companyName: parsed.user?.companyName,
      }
    } catch (error: any) {
      throw new HttpException(error.message || 'Error al registrar el usuario y empresa', error.status || HttpStatus.CONFLICT)
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
  async login(@Body() body: any, @Ip() ip: string, @Req() request: Request) {
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
      const parsed = JSON.parse(result.json)
      return {
        ...parsed,
        token: parsed.accessToken || parsed.token,
        accessToken: parsed.accessToken || parsed.token,
        tenantId: parsed.user?.tenantId || parsed.tenantId,
        userId: parsed.user?.id || parsed.userId,
        userName: parsed.user?.name,
        userEmail: parsed.user?.email,
        companyName: parsed.user?.companyName,
      }
    } catch (error: any) {
      throw new HttpException(error.message || 'Authentication failed', error.status || HttpStatus.UNAUTHORIZED)
    }
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
  async refresh(@Body() body: any, @Req() request: Request) {
    try {
      const tenantId = body.tenantId || (request.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000001'
      const result = await lastValueFrom(this.grpcService.refreshToken({ tenantId, refreshToken: body.refreshToken }))
      const parsed = JSON.parse(result.json)
      return {
        ...parsed,
        token: parsed.accessToken || parsed.token,
        accessToken: parsed.accessToken || parsed.token,
      }
    } catch (error: any) {
      throw new HttpException(error.message || 'Refresh token failed', error.status || HttpStatus.UNAUTHORIZED)
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión e invalidar tokens' })
  @ApiBody({ schema: { type: 'object', properties: { sessionId: { type: 'string', example: 'sess_12345' } } } })
  async logout(@Body() body: any) {
    try {
      await lastValueFrom(this.grpcService.logout({
        tenantId: body.tenantId || '00000000-0000-0000-0000-000000000001',
        sessionId: body.sessionId,
      }))
      return { ok: true }
    } catch (error: any) {
      throw new HttpException(error.message || 'Logout failed', error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
