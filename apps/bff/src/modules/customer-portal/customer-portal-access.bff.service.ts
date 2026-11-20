import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, OnModuleInit,
  ServiceUnavailableException, Inject,
} from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { Observable, lastValueFrom } from 'rxjs'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { TenantMembersBffService } from '../tenant-members/tenant-members.bff.service'

interface PortalAccessGrpc {
  createInvitation(data: { tenantId: string; contactId: string; email: string; invitedBy: string }): Observable<{ json: string }>
  listInvitations(data: { tenantId: string; contactId?: string }): Observable<{ jsonItems: string[] }>
  resendInvitation(data: { tenantId: string; invitationId: string }): Observable<{ json: string }>
  revokeInvitation(data: { tenantId: string; invitationId: string }): Observable<{ json: string }>
  previewInvitation(data: { token: string }): Observable<{ json: string }>
  acceptInvitation(data: { token: string; password: string }): Observable<{ json: string }>
  login(data: { tenantId: string; email: string; password: string }): Observable<{ json: string }>
  refresh(data: { tenantId: string; refreshToken: string }): Observable<{ json: string }>
  logout(data: { tenantId: string; accountId: string }): Observable<{ json: string }>
}
interface NotificationGrpc {
  sendTransientEmail(data: { tenantId: string; to: string; subject: string; body: string; isHtml: boolean }): Observable<{ json: string }>
}
type InvitationRecord = {
  id: string; tenantId: string; contactId: string; email: string
  status: string; expiresAt: string; createdAt: string
}
function parse<T>(json: string | undefined): T {
  if (!json) throw new ServiceUnavailableException('Empty API response')
  return JSON.parse(json) as T
}

@Injectable()
export class CustomerPortalAccessBffService implements OnModuleInit {
  private portal!: PortalAccessGrpc
  private notifications!: NotificationGrpc

  constructor(
    @Inject('API_CORE_GRPC') private readonly grpc: ClientGrpc,
    private readonly api: ApiCoreGrpcClient,
    private readonly members: TenantMembersBffService,
  ) {}

  onModuleInit() {
    this.portal = this.grpc.getService<PortalAccessGrpc>('CustomerPortalAccessService')
    this.notifications = this.grpc.getService<NotificationGrpc>('NotificationService')
  }

  private publicUrl(): URL {
    const configured = process.env.APP_PUBLIC_URL
    if (!configured) throw new ServiceUnavailableException('APP_PUBLIC_URL is required')
    let url: URL
    try { url = new URL(configured) } catch { throw new ServiceUnavailableException('APP_PUBLIC_URL is invalid') }
    if (!['https:', 'http:'].includes(url.protocol) ||
        (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') ||
        url.username || url.password) {
      throw new ServiceUnavailableException('APP_PUBLIC_URL must be a valid HTTPS origin in production')
    }
    return url
  }

  private async sendInvitationEmail(invitation: InvitationRecord, token: string): Promise<boolean> {
    const link = new URL('/portal/accept-invitation', this.publicUrl())
    link.searchParams.set('tenantId', invitation.tenantId)
    link.hash = new URLSearchParams({ token }).toString()
    try {
      const result = parse<{ status?: string }>((await lastValueFrom(this.notifications.sendTransientEmail({
        tenantId: invitation.tenantId,
        to: invitation.email,
        subject: 'Activa tu acceso al portal de clientes de Nexora',
        body: '<p>Tu empresa te ha invitado al portal de clientes de Nexora CRM.</p>' +
          '<p><a href="' + link.toString() + '">Activar acceso al portal</a></p>' +
          '<p>El enlace vence el ' + new Date(invitation.expiresAt).toISOString() + '.</p>' +
          '<p>Si no esperabas esta invitación, ignora este mensaje.</p>',
        isHtml: true,
      }))).json)
      return result.status === 'SENT'
    } catch {
      return false
    }
  }

  private async assertContactEmail(tenantId: string, contactId: string, email: string) {
    const contact = await this.api.getContact(tenantId, contactId)
    const currentEmail = contact.email?.trim().toLowerCase()
    if (!currentEmail || currentEmail !== email.trim().toLowerCase()) {
      throw new ConflictException('The contact email changed; issue a new portal invitation to the current address')
    }
  }

  async createInvitation(user: AuthenticatedUser, contactId: string) {
    await this.members.assertTenantAdmin(user)
    const contact = await this.api.getContact(user.tenantId, contactId)
    const email = contact.email?.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('The contact must have a valid email address before portal access can be invited')
    }
    this.publicUrl()
    const created = parse<{ invitation: InvitationRecord; token: string }>(
      (await lastValueFrom(this.portal.createInvitation({
        tenantId: user.tenantId, contactId, email, invitedBy: user.userId,
      }))).json,
    )
    const emailSent = await this.sendInvitationEmail(created.invitation, created.token)
    const { tokenHash: _secret, ...invitation } = created.invitation as InvitationRecord & { tokenHash?: string }
    return { invitation, emailSent }
  }

  async listInvitations(user: AuthenticatedUser, contactId?: string) {
    await this.members.assertTenantAdmin(user)
    const response = await lastValueFrom(this.portal.listInvitations({ tenantId: user.tenantId, contactId }))
    return (response.jsonItems ?? []).map((item) => {
      const { tokenHash: _secret, ...invitation } = JSON.parse(item) as InvitationRecord & { tokenHash?: string }
      return invitation
    })
  }

  async resendInvitation(user: AuthenticatedUser, invitationId: string) {
    await this.members.assertTenantAdmin(user)
    this.publicUrl()
    const result = parse<{ invitation: InvitationRecord; token: string }>(
      (await lastValueFrom(this.portal.resendInvitation({ tenantId: user.tenantId, invitationId }))).json,
    )
    const emailSent = await this.sendInvitationEmail(result.invitation, result.token)
    const { tokenHash: _secret, ...invitation } = result.invitation as InvitationRecord & { tokenHash?: string }
    return { invitation, emailSent }
  }

  async revokeInvitation(user: AuthenticatedUser, invitationId: string) {
    await this.members.assertTenantAdmin(user)
    return parse<{ revoked: boolean }>(
      (await lastValueFrom(this.portal.revokeInvitation({ tenantId: user.tenantId, invitationId }))).json,
    )
  }

  async previewInvitation(token: string) {
    const invitation = parse<InvitationRecord>(
      (await lastValueFrom(this.portal.previewInvitation({ token }))).json,
    )
    await this.assertContactEmail(invitation.tenantId, invitation.contactId, invitation.email)
    return {
      tenantId: invitation.tenantId, email: invitation.email,
      expiresAt: invitation.expiresAt, status: invitation.status,
    }
  }

  async acceptInvitation(token: string, password: string) {
    const invitation = await this.previewInvitation(token)
    const result = parse<{ accepted: boolean }>(
      (await lastValueFrom(this.portal.acceptInvitation({ token, password }))).json,
    )
    return { ...result, tenantId: invitation.tenantId, email: invitation.email }
  }

  async login(tenantId: string, email: string, password: string) {
    return parse<Record<string, unknown>>(
      (await lastValueFrom(this.portal.login({ tenantId, email, password }))).json,
    )
  }

  async refresh(tenantId: string, refreshToken: string) {
    return parse<Record<string, unknown>>(
      (await lastValueFrom(this.portal.refresh({ tenantId, refreshToken }))).json,
    )
  }

  async logout(user: AuthenticatedUser) {
    if (user.customerPortal !== true || !user.contactId) throw new ForbiddenException('A customer portal session is required')
    return parse<{ loggedOut: boolean }>(
      (await lastValueFrom(this.portal.logout({ tenantId: user.tenantId, accountId: user.userId }))).json,
    )
  }
}
