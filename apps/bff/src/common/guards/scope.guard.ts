import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { REQUIRED_SCOPE_KEY } from '../decorators/require-scope.decorator'

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScope = this.reflector.getAllAndOverride<string>(
      REQUIRED_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredScope) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const scopes: string[] = request.apiKeyContext?.scopes || []

    if (!scopes.includes(requiredScope)) {
      throw new ForbiddenException(
        `Forbidden: This API Key does not have the required "${requiredScope}" scope`,
      )
    }

    return true
  }
}
