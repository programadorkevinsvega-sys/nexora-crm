import { Logger, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { CustomerPortalAccessGrpcController } from './grpc/customer-portal-access.grpc.controller'
import { CustomerPortalAccessRepository } from '../domain/repositories/customer-portal-access.repository'
import { DrizzleCustomerPortalAccessRepository } from '../infrastructure/drizzle-customer-portal-access.repository'
import { CreatePortalInvitationHandler } from '../application/commands/create-portal-invitation.handler'
import { ListPortalInvitationsHandler } from '../application/commands/list-portal-invitations.handler'
import { ResendPortalInvitationHandler } from '../application/commands/resend-portal-invitation.handler'
import { RevokePortalInvitationHandler } from '../application/commands/revoke-portal-invitation.handler'
import { PreviewPortalInvitationHandler } from '../application/commands/preview-portal-invitation.handler'
import { AcceptPortalInvitationHandler } from '../application/commands/accept-portal-invitation.handler'
import { PortalLoginHandler } from '../application/commands/portal-login.handler'
import { PortalRefreshHandler } from '../application/commands/portal-refresh.handler'
import { PortalLogoutHandler } from '../application/commands/portal-logout.handler'
import { CustomerPortalTokenService } from '../application/services/customer-portal-token.service'

@Module({
  imports: [JwtModule.registerAsync({
    useFactory: () => {
      const secret = process.env.JWT_SECRET
      if (!secret) {
        Logger.error('JWT_SECRET environment variable is required', 'CustomerPortalAccessModule')
        throw new Error('JWT_SECRET environment variable is required')
      }
      return { secret, signOptions: { expiresIn: '15m' } }
    },
  })],
  controllers: [CustomerPortalAccessGrpcController],
  providers: [
    { provide: CustomerPortalAccessRepository, useClass: DrizzleCustomerPortalAccessRepository },
    CreatePortalInvitationHandler, ListPortalInvitationsHandler,
    ResendPortalInvitationHandler, RevokePortalInvitationHandler,
    PreviewPortalInvitationHandler, AcceptPortalInvitationHandler,
    PortalLoginHandler, PortalRefreshHandler, PortalLogoutHandler,
    CustomerPortalTokenService,
  ],
  exports: [CustomerPortalAccessRepository],
})
export class CustomerPortalAccessModule {}
