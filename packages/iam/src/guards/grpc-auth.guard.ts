import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = context.getArgByIndex(0)?.getMap?.() as Record<string, string> | undefined
    const token = metadata?.authorization?.replace?.('Bearer ', '')

    if (!token) throw new UnauthorizedException('Missing authorization metadata')

    try {
      this.jwtService.verify(token)
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
