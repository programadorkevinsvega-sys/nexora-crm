import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { and, desc, eq, gt, inArray, lt } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import {
  getDb,
  naturalPersonProfiles,
  outboxEvents,
  userMemberInvitations,
  users as usersTable,
} from '@crm/database'
import { UserInvitation, UserInvitationStatus } from '../domain/entities/user-invitation.entity'
import {
  PrepareInvitationAcceptance,
  UserInvitationRepository,
} from '../domain/repositories/user-invitation.repository'

@Injectable()
export class DrizzleUserInvitationRepository extends UserInvitationRepository {
  private get db() {
    return getDb()
  }

  private toDomain(row: any): UserInvitation {
    return new UserInvitation(
      row.id,
      row.tenantId,
      row.email,
      row.roleId,
      row.invitedBy,
      row.tokenHash,
      row.status as UserInvitationStatus,
      row.expiresAt,
      row.acceptedAt,
      row.acceptedUserId,
      row.revokedAt,
      row.createdAt,
      row.updatedAt,
    )
  }

  private async appendOutbox(tx: any, invitation: UserInvitation, eventType: string): Promise<void> {
    const eventId = randomUUID()
    const occurredAt = new Date().toISOString()
    await tx.insert(outboxEvents).values({
      id: eventId,
      aggregateType: 'user_invitation',
      aggregateId: invitation.id,
      eventType,
      payload: {
        eventId,
        eventType,
        eventVersion: 1,
        occurredAt,
        aggregateType: 'user_invitation',
        aggregateId: invitation.id,
        payload: {
          invitationId: invitation.id,
          tenantId: invitation.tenantId,
          email: invitation.email,
          roleId: invitation.roleId,
          invitedBy: invitation.invitedBy,
          expiresAt: invitation.expiresAt.toISOString(),
        },
      },
      published: false,
    })
  }

  async create(invitation: UserInvitation): Promise<void> {
    await this.db.transaction(async (tx) => {
      const now = new Date()
      await tx.update(userMemberInvitations).set({ status: 'EXPIRED', updatedAt: now }).where(and(
        eq(userMemberInvitations.tenantId, invitation.tenantId),
        eq(userMemberInvitations.email, invitation.email),
        eq(userMemberInvitations.status, 'PENDING'),
        lt(userMemberInvitations.expiresAt, now),
      ))
      await tx.insert(userMemberInvitations).values({
        id: invitation.id,
        tenantId: invitation.tenantId,
        email: invitation.email,
        roleId: invitation.roleId,
        invitedBy: invitation.invitedBy,
        tokenHash: invitation.tokenHash,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      })
      await this.appendOutbox(tx, invitation, 'user.invitation.created')
    })
  }

  async listByTenant(tenantId: string): Promise<UserInvitation[]> {
    const now = new Date()
    await this.db.update(userMemberInvitations)
      .set({ status: 'EXPIRED', updatedAt: now })
      .where(and(
        eq(userMemberInvitations.tenantId, tenantId),
        eq(userMemberInvitations.status, 'PENDING'),
        lt(userMemberInvitations.expiresAt, now),
      ))
    const rows = await this.db.query.userMemberInvitations.findMany({
      where: eq(userMemberInvitations.tenantId, tenantId),
      orderBy: [desc(userMemberInvitations.createdAt)],
      limit: 100,
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findById(tenantId: string, invitationId: string): Promise<UserInvitation | null> {
    const row = await this.db.query.userMemberInvitations.findFirst({
      where: and(
        eq(userMemberInvitations.tenantId, tenantId),
        eq(userMemberInvitations.id, invitationId),
      ),
    })
    return row ? this.toDomain(row) : null
  }

  async findByTokenHash(tokenHash: string): Promise<UserInvitation | null> {
    const row = await this.db.query.userMemberInvitations.findFirst({
      where: eq(userMemberInvitations.tokenHash, tokenHash),
    })
    return row ? this.toDomain(row) : null
  }

  async rotate(
    tenantId: string,
    invitationId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<UserInvitation> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.update(userMemberInvitations).set({
        tokenHash,
        status: 'PENDING',
        expiresAt,
        revokedAt: null,
        updatedAt: new Date(),
      }).where(and(
        eq(userMemberInvitations.tenantId, tenantId),
        eq(userMemberInvitations.id, invitationId),
        inArray(userMemberInvitations.status, ['PENDING', 'EXPIRED']),
      )).returning()
      if (!row) throw new ConflictException('Only pending or expired invitations can be resent')
      const invitation = this.toDomain(row)
      await this.appendOutbox(tx, invitation, 'user.invitation.resent')
      return invitation
    })
  }

  async revoke(tenantId: string, invitationId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const now = new Date()
      const [row] = await tx.update(userMemberInvitations).set({
        status: 'REVOKED',
        tokenHash: null,
        revokedAt: now,
        updatedAt: now,
      }).where(and(
        eq(userMemberInvitations.tenantId, tenantId),
        eq(userMemberInvitations.id, invitationId),
        inArray(userMemberInvitations.status, ['PENDING', 'EXPIRED']),
      )).returning()
      if (!row) {
        const existing = await tx.query.userMemberInvitations.findFirst({
          where: and(
            eq(userMemberInvitations.tenantId, tenantId),
            eq(userMemberInvitations.id, invitationId),
          ),
        })
        if (existing?.status === 'REVOKED') return
        if (!existing) throw new NotFoundException('Invitation not found')
        throw new ConflictException('An invitation that is being accepted or was accepted cannot be revoked')
      }
      await this.appendOutbox(tx, this.toDomain(row), 'user.invitation.revoked')
    })
  }

  async prepareAcceptance(
    invitationId: string,
    tokenHash: string,
    firstName: string,
    lastName: string,
    passwordHash: string,
  ): Promise<PrepareInvitationAcceptance> {
    return this.db.transaction(async (tx) => {
      const invitation = await tx.query.userMemberInvitations.findFirst({
        where: and(
          eq(userMemberInvitations.id, invitationId),
          eq(userMemberInvitations.tokenHash, tokenHash),
        ),
      })
      if (!invitation) throw new NotFoundException('Invitation token is invalid')
      if (invitation.status === 'ACCEPTING' && invitation.acceptedUserId) {
        // The original token claim happened before expiry. Allow that same
        // claimant to resume after expiry, but never create a second user.
        const [pendingUser] = await tx.update(usersTable).set({
          passwordHash,
          updatedAt: new Date(),
        }).where(and(
          eq(usersTable.tenantId, invitation.tenantId),
          eq(usersTable.id, invitation.acceptedUserId),
          eq(usersTable.status, 'INACTIVE'),
        )).returning({ id: usersTable.id })
        if (!pendingUser) {
          throw new ConflictException('The prepared invitation account cannot be resumed')
        }
        return {
          tenantId: invitation.tenantId,
          invitationId: invitation.id,
          userId: invitation.acceptedUserId,
          roleId: invitation.roleId,
        }
      }
      if (invitation.status !== 'PENDING' || invitation.expiresAt.getTime() <= Date.now()) {
        throw new ConflictException('Invitation is expired or no longer active')
      }

      const userId = randomUUID()
      const profileId = randomUUID()
      const now = new Date()
      const [claimed] = await tx.update(userMemberInvitations).set({
        status: 'ACCEPTING',
        acceptedUserId: userId,
        updatedAt: now,
      }).where(and(
        eq(userMemberInvitations.id, invitation.id),
        eq(userMemberInvitations.tenantId, invitation.tenantId),
        eq(userMemberInvitations.tokenHash, tokenHash),
        eq(userMemberInvitations.status, 'PENDING'),
        gt(userMemberInvitations.expiresAt, now),
      )).returning()

      if (!claimed) {
        const current = await tx.query.userMemberInvitations.findFirst({
          where: and(
            eq(userMemberInvitations.id, invitation.id),
            eq(userMemberInvitations.tokenHash, tokenHash),
          ),
        })
        if (current?.status === 'ACCEPTING' && current.acceptedUserId) {
          return {
            tenantId: current.tenantId,
            invitationId: current.id,
            userId: current.acceptedUserId,
            roleId: current.roleId,
          }
        }
        throw new ConflictException('Invitation was already used or expired')
      }

      await tx.insert(naturalPersonProfiles).values({
        id: profileId,
        tenantId: invitation.tenantId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        createdAt: now,
        updatedAt: now,
      })
      await tx.insert(usersTable).values({
        id: userId,
        tenantId: invitation.tenantId,
        email: invitation.email,
        passwordHash,
        profileId,
        profileType: 'NATURAL_PERSON',
        status: 'INACTIVE',
        isEmailVerified: false,
        failedLoginAttempts: 0,
        createdAt: now,
        updatedAt: now,
      })
      const prepared = this.toDomain({ ...claimed, acceptedUserId: userId })
      await this.appendOutbox(tx, prepared, 'user.invitation.accepting')
      return {
        tenantId: invitation.tenantId,
        invitationId: invitation.id,
        userId,
        roleId: invitation.roleId,
      }
    })
  }

  async completeAcceptance(tenantId: string, invitationId: string, userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const now = new Date()
      const [user] = await tx.update(usersTable).set({
        status: 'ACTIVE',
        isEmailVerified: true,
        updatedAt: now,
      }).where(and(
        eq(usersTable.tenantId, tenantId),
        eq(usersTable.id, userId),
        eq(usersTable.status, 'INACTIVE'),
      )).returning()
      if (!user) {
        const existing = await tx.query.users.findFirst({
          where: and(eq(usersTable.tenantId, tenantId), eq(usersTable.id, userId)),
        })
        if (existing?.status !== 'ACTIVE' || !existing.isEmailVerified) {
          throw new NotFoundException('Pending invited user not found')
        }
      }

      const [row] = await tx.update(userMemberInvitations).set({
        status: 'ACCEPTED',
        tokenHash: null,
        acceptedAt: now,
        updatedAt: now,
      }).where(and(
        eq(userMemberInvitations.tenantId, tenantId),
        eq(userMemberInvitations.id, invitationId),
        eq(userMemberInvitations.acceptedUserId, userId),
        eq(userMemberInvitations.status, 'ACCEPTING'),
      )).returning()
      if (!row) {
        const existing = await tx.query.userMemberInvitations.findFirst({
          where: and(
            eq(userMemberInvitations.tenantId, tenantId),
            eq(userMemberInvitations.id, invitationId),
          ),
        })
        if (existing?.status === 'ACCEPTED' && existing.acceptedUserId === userId) return
        throw new ConflictException('Invitation acceptance could not be finalized')
      }
      await this.appendOutbox(tx, this.toDomain(row), 'user.invitation.accepted')
    })
  }
}
