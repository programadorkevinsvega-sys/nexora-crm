import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { ApiCoreGrpcClient } from '../grpc/api-core-grpc.client'
import { CacheService } from '../cache/cache.service'

interface ApiKeyRequest {
  headers: Record<string, string | string[] | undefined>
  apiKeyContext?: { tenantId: string; scopes: string[]; keyId: string }
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly grpc: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiKeyRequest>()
    const rawKey = this.extractKey(request)
    if (!rawKey) {
      throw new UnauthorizedException(
        'API Key required. Pass via "Authorization: Bearer nex_live_..." or "X-Api-Key" header',
      )
    }

    const validation = await this.grpc.validateApiKey(rawKey)
    if (!validation.valid) {
      throw new UnauthorizedException('Invalid, revoked, or expired API Key')
    }

    // Rate Limiting: 100 requests / minute per API key using Redis sliding count
    const rateLimitKey = `rate:apikey:${validation.keyId}`
    const count = await this.cache.increment(rateLimitKey, 60)
    if (count > 100) {
      throw new HttpException(
        'Rate limit exceeded (100 requests/minute). Please retry shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    request.apiKeyContext = {
      tenantId: validation.tenantId,
      scopes: validation.scopes,
      keyId: validation.keyId,
    }
    request.headers['x-tenant-id'] = validation.tenantId

    return true
  }

  private extractKey(request: ApiKeyRequest): string {
    const authorization = request.headers['authorization']
    const authHeader = typeof authorization === 'string' ? authorization : ''
    if (authHeader.startsWith('Bearer nex_')) {
      return authHeader.slice(7).trim()
    }
    const apiKeyValue = request.headers['x-api-key']
    const apiKeyHeader = typeof apiKeyValue === 'string' ? apiKeyValue : ''
    if (apiKeyHeader.startsWith('nex_')) {
      return apiKeyHeader.trim()
    }
    return ''
  }
}
