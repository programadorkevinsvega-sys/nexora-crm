import { createHmac, timingSafeEqual } from 'crypto'
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

type JwtPayload = {
  sub?: string
  tenantId?: string
  email?: string
  role?: string
  roles?: string[]
  exp?: number
  [key: string]: unknown
}

const PUBLIC_PATHS = ['/api/v1', '/api/webhooks/whatsapp']

@Injectable()
export class BffJwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    if (this.isPublicPath(request.path)) return true

    const token = this.extractBearerToken(request.headers.authorization)
    const payload = this.verifyToken(token)

    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Token is missing required identity claims')
    }

    request.user = payload
    request.userId = payload.sub
    request.tenantId = payload.tenantId
    request.headers['x-tenant-id'] = payload.tenantId
    request.headers['x-user-id'] = payload.sub

    if (payload.role) request.headers['x-user-role'] = payload.role
    else delete request.headers['x-user-role']

    return true
  }

  private isPublicPath(path: string): boolean {
    return PUBLIC_PATHS.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`))
  }

  private extractBearerToken(header?: string): string {
    if (!header || !/^Bearer\s+\S+$/i.test(header)) {
      throw new UnauthorizedException('Missing or invalid authorization header')
    }
    return header.replace(/^Bearer\s+/i, '').trim()
  }

  private verifyToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new UnauthorizedException('JWT authentication is not configured')

    const parts = token.split('.')
    if (parts.length !== 3) throw new UnauthorizedException('Invalid token')

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header = this.decodeJson<{ alg?: string }>(encodedHeader)
    if (header.alg !== 'HS256') throw new UnauthorizedException('Unsupported token algorithm')

    const expected = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest()
    const received = this.decodeBase64Url(encodedSignature)
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      throw new UnauthorizedException('Invalid token signature')
    }

    const payload = this.decodeJson<JwtPayload>(encodedPayload)
    if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token is expired')
    }
    return payload
  }

  private decodeJson<T>(value: string): T {
    try {
      return JSON.parse(this.decodeBase64Url(value).toString('utf8')) as T
    } catch {
      throw new UnauthorizedException('Invalid token encoding')
    }
  }

  private decodeBase64Url(value: string): Buffer {
    return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  }
}
