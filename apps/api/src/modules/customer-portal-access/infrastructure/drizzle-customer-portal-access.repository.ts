import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { and, desc, eq, gt, inArray, lt } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { customerPortalAccounts, customerPortalInvitations, getDb } from '@crm/database'
import { CustomerPortalAccessRepository, PortalAccount, PortalInvitation } from '../domain/repositories/customer-portal-access.repository'

@Injectable()
export class DrizzleCustomerPortalAccessRepository extends CustomerPortalAccessRepository {
  private get db() { return getDb() }

  private toInvitation(row: any): PortalInvitation {
    return {
      id: row.id, tenantId: row.tenantId, contactId: row.contactId, email: row.email,
      invitedBy: row.invitedBy, tokenHash: row.tokenHash, status: row.status,
      expiresAt: row.expiresAt, acceptedAt: row.acceptedAt, revokedAt: row.revokedAt, createdAt: row.createdAt,
    }
  }

  private toAccount(row: any): PortalAccount {
    return {
      id: row.id, tenantId: row.tenantId, contactId: row.contactId, email: row.email,
      passwordHash: row.passwordHash, status: row.status,
      refreshTokenHash: row.refreshTokenHash, refreshTokenExpiresAt: row.refreshTokenExpiresAt,
    }
  }

  async createInvitation(input: Omit<PortalInvitation, 'acceptedAt' | 'createdAt'>): Promise<PortalInvitation> {
    return this.db.transaction(async (tx) => {
      const now = new Date()
      await tx.update(customerPortalInvitations).set({ status: 'EXPIRED', tokenHash: null, updatedAt: now })
        .where(and(eq(customerPortalInvitations.tenantId, input.tenantId),
          eq(customerPortalInvitations.contactId, input.contactId),
          eq(customerPortalInvitations.status, 'PENDING'),
          lt(customerPortalInvitations.expiresAt, now)))
      const [row] = await tx.insert(customerPortalInvitations).values({
        ...input, createdAt: now, updatedAt: now,
      }).returning()
      return this.toInvitation(row)
    })
  }

  async listInvitations(tenantId: string, contactId?: string): Promise<PortalInvitation[]> {
    const now = new Date()
    await this.db.update(customerPortalInvitations).set({ status: 'EXPIRED', tokenHash: null, updatedAt: now })
      .where(and(eq(customerPortalInvitations.tenantId, tenantId),
        eq(customerPortalInvitations.status, 'PENDING'),
        lt(customerPortalInvitations.expiresAt, now)))
    const rows = await this.db.query.customerPortalInvitations.findMany({
      where: contactId
        ? and(eq(customerPortalInvitations.tenantId, tenantId), eq(customerPortalInvitations.contactId, contactId))
        : eq(customerPortalInvitations.tenantId, tenantId),
      orderBy: [desc(customerPortalInvitations.createdAt)], limit: 100,
    })
    return rows.map((row) => this.toInvitation(row))
  }

  async findInvitationById(tenantId: string, invitationId: string): Promise<PortalInvitation | null> {
    const row = await this.db.query.customerPortalInvitations.findFirst({
      where: and(eq(customerPortalInvitations.tenantId, tenantId), eq(customerPortalInvitations.id, invitationId)),
    })
    return row ? this.toInvitation(row) : null
  }

  async findInvitationByTokenHash(tokenHash: string): Promise<PortalInvitation | null> {
    const row = await this.db.query.customerPortalInvitations.findFirst({
      where: eq(customerPortalInvitations.tokenHash, tokenHash),
    })
    return row ? this.toInvitation(row) : null
  }

  async rotateInvitation(tenantId: string, invitationId: string, tokenHash: string, expiresAt: Date): Promise<PortalInvitation> {
    const [row] = await this.db.update(customerPortalInvitations).set({
      tokenHash, status: 'PENDING', expiresAt, revokedAt: null, updatedAt: new Date(),
    }).where(and(eq(customerPortalInvitations.tenantId, tenantId),
      eq(customerPortalInvitations.id, invitationId),
      inArray(customerPortalInvitations.status, ['PENDING', 'EXPIRED'])))
      .returning()
    if (!row) throw new ConflictException('Only pending or expired portal invitations can be resent')
    return this.toInvitation(row)
  }

  async revokeInvitation(tenantId: string, invitationId: string): Promise<void> {
    const now = new Date()
    const [row] = await this.db.update(customerPortalInvitations).set({
      status: 'REVOKED', tokenHash: null, revokedAt: now, updatedAt: now,
    }).where(and(eq(customerPortalInvitations.tenantId, tenantId),
      eq(customerPortalInvitations.id, invitationId),
      inArray(customerPortalInvitations.status, ['PENDING', 'EXPIRED'])))
      .returning({ id: customerPortalInvitations.id })
    if (!row) {
      const existing = await this.findInvitationById(tenantId, invitationId)
      if (existing?.status === 'REVOKED') return
      if (!existing) throw new NotFoundException('Portal invitation not found')
      throw new ConflictException('Accepted portal invitations cannot be revoked')
    }
  }

  async acceptInvitation(tokenHash: string, passwordHash: string) {
    return this.db.transaction(async (tx) => {
      const now = new Date()
      const [invitation] = await tx.update(customerPortalInvitations).set({
        status: 'ACCEPTED', tokenHash: null, acceptedAt: now, updatedAt: now,
      }).where(and(eq(customerPortalInvitations.tokenHash, tokenHash),
        eq(customerPortalInvitations.status, 'PENDING'),
        gt(customerPortalInvitations.expiresAt, now)))
        .returning()
      if (!invitation) throw new ConflictException('Portal invitation is invalid, expired or already used')
      const [account] = await tx.insert(customerPortalAccounts).values({
        id: randomUUID(), tenantId: invitation.tenantId, contactId: invitation.contactId,
        email: invitation.email, passwordHash, status: 'ACTIVE', emailVerifiedAt: now,
        createdAt: now, updatedAt: now,
      }).returning({ id: customerPortalAccounts.id })
      return {
        accountId: account.id, tenantId: invitation.tenantId,
        contactId: invitation.contactId, email: invitation.email,
      }
    })
  }

  async findAccountByEmail(tenantId: string, email: string): Promise<PortalAccount | null> {
    const row = await this.db.query.customerPortalAccounts.findFirst({
      where: and(eq(customerPortalAccounts.tenantId, tenantId), eq(customerPortalAccounts.email, email)),
    })
    return row ? this.toAccount(row) : null
  }

  async findAccountByContact(tenantId: string, contactId: string): Promise<PortalAccount | null> {
    const row = await this.db.query.customerPortalAccounts.findFirst({
      where: and(eq(customerPortalAccounts.tenantId, tenantId), eq(customerPortalAccounts.contactId, contactId)),
    })
    return row ? this.toAccount(row) : null
  }

  async findAccountByContact(tenantId: string, contactId: string): Promise<PortalAccount | null> {
    const row = await this.db.query.customerPortalAccounts.findFirst({
      where: and(eq(customerPortalAccounts.tenantId, tenantId), eq(customerPortalAccounts.contactId, contactId)),
    })
    return row ? this.toAccount(row) : null
  }

  async findAccountById(tenantId: string, accountId: string): Promise<PortalAccount | null> {
    const row = await this.db.query.customerPortalAccounts.findFirst({
      where: and(eq(customerPortalAccounts.tenantId, tenantId), eq(customerPortalAccounts.id, accountId)),
    })
    return row ? this.toAccount(row) : null
  }

  async recordLogin(tenantId: string, accountId: string, refreshTokenHash: string, refreshExpiresAt: Date): Promise<void> {
    await this.db.update(customerPortalAccounts).set({
      refreshTokenHash, refreshTokenExpiresAt: refreshExpiresAt, lastLoginAt: new Date(), updatedAt: new Date(),
    }).where(and(eq(customerPortalAccounts.tenantId, tenantId),
      eq(customerPortalAccounts.id, accountId), eq(customerPortalAccounts.status, 'ACTIVE')))
  }

  async rotateRefreshToken(tenantId: string, accountId: string, oldHash: string, nextHash: string, expiresAt: Date): Promise<boolean> {
    const [row] = await this.db.update(customerPortalAccounts).set({
      refreshTokenHash: nextHash, refreshTokenExpiresAt: expiresAt, updatedAt: new Date(),
    }).where(and(eq(customerPortalAccounts.tenantId, tenantId),
      eq(customerPortalAccounts.id, accountId), eq(customerPortalAccounts.refreshTokenHash, oldHash),
      eq(customerPortalAccounts.status, 'ACTIVE'))).returning({ id: customerPortalAccounts.id })
    return Boolean(row)
  }

  async revokeRefreshToken(tenantId: string, accountId: string): Promise<void> {
    await this.db.update(customerPortalAccounts).set({
      refreshTokenHash: null, refreshTokenExpiresAt: null, updatedAt: new Date(),
    }).where(and(eq(customerPortalAccounts.tenantId, tenantId), eq(customerPortalAccounts.id, accountId)))
  }
}
