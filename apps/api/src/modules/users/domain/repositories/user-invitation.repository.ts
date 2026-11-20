import { UserInvitation } from '../entities/user-invitation.entity'

export interface PrepareInvitationAcceptance {
  tenantId: string
  invitationId: string
  userId: string
  roleId: string
}

export abstract class UserInvitationRepository {
  abstract create(invitation: UserInvitation): Promise<void>
  abstract listByTenant(tenantId: string): Promise<UserInvitation[]>
  abstract findById(tenantId: string, invitationId: string): Promise<UserInvitation | null>
  abstract findByTokenHash(tokenHash: string): Promise<UserInvitation | null>
  abstract rotate(
    tenantId: string,
    invitationId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<UserInvitation>
  abstract revoke(tenantId: string, invitationId: string): Promise<void>
  abstract prepareAcceptance(
    invitationId: string,
    tokenHash: string,
    firstName: string,
    lastName: string,
    passwordHash: string,
  ): Promise<PrepareInvitationAcceptance>
  abstract completeAcceptance(
    tenantId: string,
    invitationId: string,
    userId: string,
  ): Promise<void>
}
