import { Controller, UseFilters } from '@nestjs/common'
import { CustomerPortalGrpcErrorFilter } from './customer-portal-error.filter'
import { GrpcMethod } from '@nestjs/microservices'
import { CreatePortalInvitationHandler } from '../../application/commands/create-portal-invitation.handler'
import { ListPortalInvitationsHandler } from '../../application/commands/list-portal-invitations.handler'
import { ResendPortalInvitationHandler } from '../../application/commands/resend-portal-invitation.handler'
import { RevokePortalInvitationHandler } from '../../application/commands/revoke-portal-invitation.handler'
import { PreviewPortalInvitationHandler } from '../../application/commands/preview-portal-invitation.handler'
import { AcceptPortalInvitationHandler } from '../../application/commands/accept-portal-invitation.handler'
import { PortalLoginHandler } from '../../application/commands/portal-login.handler'
import { PortalRefreshHandler } from '../../application/commands/portal-refresh.handler'
import { PortalLogoutHandler } from '../../application/commands/portal-logout.handler'

@Controller()
@UseFilters(CustomerPortalGrpcErrorFilter)
export class CustomerPortalAccessGrpcController {
  constructor(
    private readonly createInvitation: CreatePortalInvitationHandler,
    private readonly listInvitations: ListPortalInvitationsHandler,
    private readonly resendInvitation: ResendPortalInvitationHandler,
    private readonly revokeInvitation: RevokePortalInvitationHandler,
    private readonly previewInvitation: PreviewPortalInvitationHandler,
    private readonly acceptInvitation: AcceptPortalInvitationHandler,
    private readonly loginHandler: PortalLoginHandler,
    private readonly refreshHandler: PortalRefreshHandler,
    private readonly logoutHandler: PortalLogoutHandler,
  ) {}

  @GrpcMethod('CustomerPortalAccessService', 'CreateInvitation')
  async create(data: { tenantId: string; contactId: string; email: string; invitedBy: string }) {
    return { json: JSON.stringify(await this.createInvitation.execute(data)) }
  }

  @GrpcMethod('CustomerPortalAccessService', 'ListInvitations')
  async list(data: { tenantId: string; contactId?: string }) {
    const result = await this.listInvitations.execute(data.tenantId, data.contactId)
    return { jsonItems: result.map((item) => JSON.stringify({ ...item, tokenHash: undefined })) }
  }

  @GrpcMethod('CustomerPortalAccessService', 'ResendInvitation')
  async resend(data: { tenantId: string; invitationId: string }) {
    return { json: JSON.stringify(await this.resendInvitation.execute(data.tenantId, data.invitationId)) }
  }

  @GrpcMethod('CustomerPortalAccessService', 'RevokeInvitation')
  async revoke(data: { tenantId: string; invitationId: string }) {
    return { json: JSON.stringify(await this.revokeInvitation.execute(data.tenantId, data.invitationId)) }
  }

  @GrpcMethod('CustomerPortalAccessService', 'PreviewInvitation')
  async preview(data: { token: string }) {
    return { json: JSON.stringify(await this.previewInvitation.execute(data.token)) }
  }

  @GrpcMethod('CustomerPortalAccessService', 'AcceptInvitation')
  async accept(data: { token: string; password: string }) {
    return { json: JSON.stringify(await this.acceptInvitation.execute(data.token, data.password)) }
  }

  @GrpcMethod('CustomerPortalAccessService', 'Login')
  async login(data: { tenantId: string; email: string; password: string }) {
    return { json: JSON.stringify(await this.loginHandler.execute(data.tenantId, data.email, data.password)) }
  }

  @GrpcMethod('CustomerPortalAccessService', 'Refresh')
  async refresh(data: { tenantId: string; refreshToken: string }) {
    return { json: JSON.stringify(await this.refreshHandler.execute(data.tenantId, data.refreshToken)) }
  }

  @GrpcMethod('CustomerPortalAccessService', 'Logout')
  async logout(data: { tenantId: string; accountId: string }) {
    return { json: JSON.stringify(await this.logoutHandler.execute(data.tenantId, data.accountId)) }
  }
}
