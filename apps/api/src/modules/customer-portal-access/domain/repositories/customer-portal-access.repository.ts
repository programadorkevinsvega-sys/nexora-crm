export type PortalInvitation = {
  id: string
  tenantId: string
  contactId: string
  email: string
  invitedBy: string
  tokenHash: string | null
  status: string
  expiresAt: Date
  acceptedAt: Date | null
  revokedAt: Date | null
  createdAt: Date
}

export type PortalAccount = {
  id: string
  tenantId: string
  contactId: string
  email: string
  passwordHash: string
  status: string
  refreshTokenHash: string | null
  refreshTokenExpiresAt: Date | null
}

export abstract class CustomerPortalAccessRepository {
  abstract createInvitation(input: Omit<PortalInvitation, 'acceptedAt' | 'createdAt'>): Promise<PortalInvitation>
  abstract listInvitations(tenantId: string, contactId?: string): Promise<PortalInvitation[]>
  abstract findInvitationById(tenantId: string, invitationId: string): Promise<PortalInvitation | null>
  abstract findInvitationByTokenHash(tokenHash: string): Promise<PortalInvitation | null>
  abstract rotateInvitation(tenantId: string, invitationId: string, tokenHash: string, expiresAt: Date): Promise<PortalInvitation>
  abstract revokeInvitation(tenantId: string, invitationId: string): Promise<void>
  abstract acceptInvitation(tokenHash: string, passwordHash: string): Promise<{ accountId: string; tenantId: string; contactId: string; email: string }>
  abstract findAccountByEmail(tenantId: string, email: string): Promise<PortalAccount | null>
  abstract findAccountByContact(tenantId: string, contactId: string): Promise<PortalAccount | null>
  abstract findAccountById(tenantId: string, accountId: string): Promise<PortalAccount | null>
  abstract recordLogin(tenantId: string, accountId: string, refreshTokenHash: string, refreshExpiresAt: Date): Promise<void>
  abstract rotateRefreshToken(tenantId: string, accountId: string, oldHash: string, nextHash: string, expiresAt: Date): Promise<boolean>
  abstract revokeRefreshToken(tenantId: string, accountId: string): Promise<void>
}
