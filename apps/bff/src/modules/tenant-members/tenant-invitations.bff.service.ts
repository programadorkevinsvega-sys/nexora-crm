import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { Observable, lastValueFrom } from 'rxjs'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { TenantMembersBffService } from './tenant-members.bff.service'

interface UserInvitationsGrpcService {
  createInvitation(data: { tenantId: string; email: string; roleId: string; invitedBy: string }): Observable<{ json: string }>
  listInvitations(data: { tenantId: string }): Observable<{ jsonItems: string[] }>
  revokeInvitation(data: { tenantId: string; invitationId: string }): Observable<{ json: string }>
  resendInvitation(data: { tenantId: string; invitationId: string }): Observable<{ json: string }>
  getInvitationByToken(data: { token: string }): Observable<{ json: string }>
  prepareInvitationAcceptance(data: {
    token: string; firstName: string; lastName: string; password: string
  }): Observable<{ json: string }>
  completeInvitationAcceptance(data: {
    tenantId: string; invitationId: string; userId: string
  }): Observable<{ json: string }>
}

interface IamInvitationGrpcService {
  replaceUserRole(data: {
    tenantId: string; userId: string; roleId: string
  }): Observable<Record<string, never>>
}

interface NotificationGrpcService {
  sendTransientEmail(data: {
    tenantId: string; to: string; subject: string; body: string; isHtml: boolean
  }): Observable<{ json: string }>
}

type InvitationRecord = {
  id: string
  tenantId: string
  email: string
  roleId: string
  status: string
  expiresAt: string
  createdAt: string
}

function parseJson<T>(value: string | undefined): T {
  if (!value) throw new ServiceUnavailableException('The API returned an empty response')
  return JSON.parse(value) as T
}

@Injectable()
export class TenantInvitationsBffService implements OnModuleInit {
  private users!: UserInvitationsGrpcService
  private iam!: IamInvitationGrpcService
  private notifications!: NotificationGrpcService

  constructor(
    @Inject('API_CORE_GRPC') private readonly grpc: ClientGrpc,
    private readonly members: TenantMembersBffService,
  ) {}

  onModuleInit(): void {
    this.users = this.grpc.getService<UserInvitationsGrpcService>('UserService')
    this.iam = this.grpc.getService<IamInvitationGrpcService>('IamService')
    this.notifications = this.grpc.getService<NotificationGrpcService>('NotificationService')
  }

  private invitationBaseUrl(): URL {
    const configured = process.env.APP_PUBLIC_URL
    if (!configured) {
      throw new ServiceUnavailableException('APP_PUBLIC_URL must be configured before sending invitations')
    }
    let url: URL
    try {
      url = new URL(configured)
    } catch {
      throw new ServiceUnavailableException('APP_PUBLIC_URL is invalid')
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new ServiceUnavailableException('APP_PUBLIC_URL must use HTTP or HTTPS')
    }
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      throw new ServiceUnavailableException('APP_PUBLIC_URL must use HTTPS in production')
    }
    if (url.username || url.password) {
      throw new ServiceUnavailableException('APP_PUBLIC_URL cannot contain credentials')
    }
    return url
  }

  private async sendInvitationEmail(invitation: InvitationRecord, token: string): Promise<boolean> {
    const link = new URL('/accept-invitation', this.invitationBaseUrl())
    // Fragments are not sent in HTTP requests or Referer headers.
    link.hash = new URLSearchParams({ token }).toString()
    const subject = 'Invitación para unirte a Nexora CRM'
    const body = [
      '<p>Has recibido una invitación para unirte al equipo de una empresa en Nexora CRM.</p>',
      '<p><a href="' + link.toString() + '">Aceptar invitación</a></p>',
      '<p>El enlace vence el ' + new Date(invitation.expiresAt).toLocaleString('es-CO', { timeZone: 'UTC' }) + ' UTC.</p>',
      '<p>Si no esperabas esta invitación, puedes ignorar este correo.</p>',
    ].join('')
    try {
      const response = await lastValueFrom(this.notifications.sendTransientEmail({
        tenantId: invitation.tenantId,
        to: invitation.email,
        subject,
        body,
        isHtml: true,
      }))
      const sent = parseJson<{ status?: string }>(response.json)
      return sent.status === 'SENT'
    } catch {
      return false
    }
  }

  async createInvitation(user: AuthenticatedUser, email: string, roleId: string) {
    await this.members.assertTenantAdmin(user)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(roleId)) {
      throw new BadRequestException('roleId must be a valid UUID')
    }
    const roles = await this.members.listAssignableRoles(user.tenantId)
    if (!roles.some((role) => role.id === roleId)) {
      throw new NotFoundException('Role is not available to this tenant')
    }
    this.invitationBaseUrl()
    const result = parseJson<{ invitation: InvitationRecord; token: string }>(
      (await lastValueFrom(this.users.createInvitation({
        tenantId: user.tenantId,
        email,
        roleId,
        invitedBy: user.userId,
      }))).json,
    )
    const emailSent = await this.sendInvitationEmail(result.invitation, result.token)
    return { invitation: result.invitation, emailSent }
  }

  async listInvitations(user: AuthenticatedUser) {
    await this.members.assertTenantAdmin(user)
    const response = await lastValueFrom(this.users.listInvitations({ tenantId: user.tenantId }))
    return (response.jsonItems ?? []).map((item) => JSON.parse(item) as InvitationRecord)
  }

  async revokeInvitation(user: AuthenticatedUser, invitationId: string) {
    await this.members.assertTenantAdmin(user)
    const response = await lastValueFrom(this.users.revokeInvitation({
      tenantId: user.tenantId,
      invitationId,
    }))
    return parseJson<{ revoked: boolean }>(response.json)
  }

  async resendInvitation(user: AuthenticatedUser, invitationId: string) {
    await this.members.assertTenantAdmin(user)
    this.invitationBaseUrl()
    const result = parseJson<{ invitation: InvitationRecord; token: string }>(
      (await lastValueFrom(this.users.resendInvitation({
        tenantId: user.tenantId,
        invitationId,
      }))).json,
    )
    const emailSent = await this.sendInvitationEmail(result.invitation, result.token)
    return { invitation: result.invitation, emailSent }
  }

  async getInvitationPreview(token: string) {
    const invitation = parseJson<InvitationRecord>(
      (await lastValueFrom(this.users.getInvitationByToken({ token }))).json,
    )
    const validState = invitation.status === 'PENDING' || invitation.status === 'ACCEPTING'
    if (!validState || (invitation.status === 'PENDING' && new Date(invitation.expiresAt).getTime() <= Date.now())) {
      throw new ConflictException('This invitation has expired or is no longer active')
    }
    return {
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    }
  }

  async acceptInvitation(input: {
    token: string; firstName: string; lastName: string; password: string
  }) {
    const invitation = parseJson<InvitationRecord>(
      (await lastValueFrom(this.users.getInvitationByToken({ token: input.token }))).json,
    )
    if (
      !['PENDING', 'ACCEPTING'].includes(invitation.status) ||
      (invitation.status === 'PENDING' && new Date(invitation.expiresAt).getTime() <= Date.now())
    ) {
      throw new ConflictException('This invitation has expired or is no longer active')
    }

    const roles = await this.members.listAssignableRoles(invitation.tenantId)
    if (!roles.some((role) => role.id === invitation.roleId)) {
      throw new ConflictException('The invitation role is no longer available; contact the tenant administrator')
    }

    const prepared = parseJson<{
      tenantId: string; invitationId: string; userId: string; roleId: string
    }>(
      (await lastValueFrom(this.users.prepareInvitationAcceptance(input))).json,
    )
    if (
      prepared.tenantId !== invitation.tenantId ||
      prepared.invitationId !== invitation.id ||
      prepared.roleId !== invitation.roleId
    ) {
      throw new ConflictException('Invitation identity validation failed')
    }

    // If this gRPC call fails, the invitation remains ACCEPTING and the same
    // token can retry safely; IAM role replacement is an idempotent operation.
    await lastValueFrom(this.iam.replaceUserRole({
      tenantId: prepared.tenantId,
      userId: prepared.userId,
      roleId: prepared.roleId,
    }))
    await lastValueFrom(this.users.completeInvitationAcceptance({
      tenantId: prepared.tenantId,
      invitationId: prepared.invitationId,
      userId: prepared.userId,
    }))
    return { accepted: true, email: invitation.email }
  }
}
