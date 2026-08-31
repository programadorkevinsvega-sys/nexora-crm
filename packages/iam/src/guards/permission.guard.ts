import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredPermissions?.length) return true

    const request = context.switchToHttp().getRequest()
    const userPermissions: string[] = request?.user?.permissions ?? []

    const hasAll = requiredPermissions.every(p => userPermissions.includes(p))
    if (!hasAll) throw new ForbiddenException('Insufficient permissions')
    return true
  }
}
