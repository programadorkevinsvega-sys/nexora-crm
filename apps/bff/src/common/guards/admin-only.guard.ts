import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new UnauthorizedException('Authentication required')
    }

    const role = (user.role || '').toLowerCase()
    const roles: string[] = (user.roles || []).map((r: string) => r.toLowerCase())

    const isAdmin =
      role === 'admin' ||
      role === 'owner' ||
      role === 'superadmin' ||
      roles.includes('admin') ||
      roles.includes('owner') ||
      roles.includes('superadmin')

    if (!isAdmin) {
      throw new ForbiddenException(
        'Acceso restringido: Solo los administradores pueden gestionar Claves de API y configuración de desarrollador',
      )
    }

    return true
  }
}
