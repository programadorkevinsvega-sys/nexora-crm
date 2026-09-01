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
import { ClientGrpc } from '@nestjs/microservices'
import { Observable, lastValueFrom } from 'rxjs'
import { Request } from 'express'

interface GrpcAuthService {
  register(data: any): Observable<{ json: string }>
  login(data: any): Observable<{ json: string }>
  verifyToken(data: { token: string }): Observable<{ json: string }>
  refreshToken(data: any): Observable<{ json: string }>
  logout(data: { tenantId: string; sessionId: string }): Observable<any>
}

@Controller('api/auth')
export class AuthBffController implements OnModuleInit {
  private grpcService!: GrpcAuthService

  constructor(@Inject('AUTH_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.grpcService = this.client.getService<GrpcAuthService>('AuthService')
  }

  @Post('register')
  async register(
    @Body() body: any,
    @Ip() ip: string,
    @Req() request: Request,
  ) {
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
      return JSON.parse(result.json)
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al registrar el usuario y empresa',
        error.status || HttpStatus.CONFLICT,
      )
    }
  }

  @Post('login')
  async login(
    @Body() body: any,
    @Ip() ip: string,
    @Req() request: Request,
  ) {
    const userAgentHeader = request.headers['user-agent']
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader

    try {
      const tenantId = body.tenantId || (request.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000001'
      const result = await lastValueFrom(
        this.grpcService.login({
          tenantId,
          email: body.email,
          password: body.password,
          ipAddress: body.ipAddress ?? ip,
          userAgent: body.userAgent ?? userAgent,
          deviceId: body.deviceId,
          mfaCode: body.mfaCode,
        })
      )
      return JSON.parse(result.json)
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Authentication failed',
        error.status || HttpStatus.UNAUTHORIZED,
      )
    }
  }

  @Post('refresh')
  async refresh(@Body() body: any, @Req() request: Request) {
    try {
      const tenantId = body.tenantId || (request.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000001'
      const result = await lastValueFrom(
        this.grpcService.refreshToken({
          tenantId,
          refreshToken: body.refreshToken,
        })
      )
      return JSON.parse(result.json)
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Refresh token failed',
        error.status || HttpStatus.UNAUTHORIZED,
      )
    }
  }

  @Post('logout')
  async logout(@Body() body: any) {
    try {
      await lastValueFrom(
        this.grpcService.logout({
          tenantId: body.tenantId,
          sessionId: body.sessionId,
        })
      )
      return { ok: true }
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Logout failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
