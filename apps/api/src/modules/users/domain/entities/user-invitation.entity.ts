export type UserInvitationStatus = 'PENDING' | 'ACCEPTING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'

export class UserInvitation {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly email: string,
    readonly roleId: string,
    readonly invitedBy: string,
    readonly tokenHash: string | null,
    readonly status: UserInvitationStatus,
    readonly expiresAt: Date,
    readonly acceptedAt: Date | null,
    readonly acceptedUserId: string | null,
    readonly revokedAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  isExpired(now = new Date()): boolean {
    return this.status === 'PENDING' && this.expiresAt.getTime() <= now.getTime()
  }

  canBeResent(): boolean {
    return this.status === 'PENDING' || this.status === 'EXPIRED'
  }

  toPublicResponse() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      email: this.email,
      roleId: this.roleId,
      invitedBy: this.invitedBy,
      status: this.isExpired() ? 'EXPIRED' : this.status,
      expiresAt: this.expiresAt.toISOString(),
      acceptedAt: this.acceptedAt?.toISOString() ?? null,
      acceptedUserId: this.acceptedUserId,
      revokedAt: this.revokedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
    }
  }
}
