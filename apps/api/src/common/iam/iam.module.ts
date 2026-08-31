import { Module, Global, Logger } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard, PermissionGuard } from '@crm/iam'

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET
        if (!secret) {
          Logger.error('JWT_SECRET environment variable is required', 'IamModule')
          throw new Error('JWT_SECRET environment variable is required')
        }
        return { secret, signOptions: { expiresIn: '24h' } }
      },
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
  exports: [JwtModule],
})
export class GlobalIamModule {}
