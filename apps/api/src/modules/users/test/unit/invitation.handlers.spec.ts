import { createHash } from 'crypto'
import * as bcrypt from 'bcrypt'
import { ConflictException } from '@nestjs/common'
import { User } from '../../domain/entities/user.entity'
import { UserInvitation } from '../../domain/entities/user-invitation.entity'
import { CreateInvitationCommand, CreateInvitationHandler } from '../../application/commands/create-invitation.handler'
import {
  PrepareInvitationAcceptanceCommand,
  PrepareInvitationAcceptanceHandler,
} from '../../application/commands/prepare-invitation-acceptance.handler'
import {
  GetInvitationByTokenHandler,
  GetInvitationByTokenQuery,
} from '../../application/queries/get-invitation-by-token.handler'

const TENANT_ID = '00000000-0000-4000-8000-000000000001'
const ROLE_ID = '00000000-0000-4000-8000-000000000002'
const INVITER_ID = '00000000-0000-4000-8000-000000000003'
const INVITATION_ID = '00000000-0000-4000-8000-000000000004'

function invitation(tokenHash: string | null = 'a'.repeat(64)) {
  const now = new Date()
  return new UserInvitation(
    INVITATION_ID, TENANT_ID, 'member@example.com', ROLE_ID, INVITER_ID,
    tokenHash, 'PENDING', new Date(Date.now() + 60_000), null, null, null, now, now,
  )
}

describe('tenant member invitation handlers', () => {
  it('stores only a hash of a random one-time token and enforces an expiry', async () => {
    const users = { findByEmail: jest.fn().mockResolvedValue(null) }
    const invitations = { create: jest.fn().mockResolvedValue(undefined) }
    const handler = new CreateInvitationHandler(invitations as any, users as any)

    const result = await handler.execute(new CreateInvitationCommand(
      TENANT_ID, ' Member@Example.com ', ROLE_ID, INVITER_ID,
    ))

    expect(result.token).toHaveLength(43)
    expect(result.invitation.email).toBe('member@example.com')
    expect(invitations.create).toHaveBeenCalledTimes(1)
    const persisted = invitations.create.mock.calls[0][0] as UserInvitation
    expect(persisted.tokenHash).toBe(createHash('sha256').update(result.token).digest('hex'))
    expect(persisted.tokenHash).not.toBe(result.token)
    expect(persisted.expiresAt.getTime()).toBeGreaterThan(Date.now() + 6 * 24 * 60 * 60 * 1000)
  })

  it('rejects inviting an email already registered inside the same tenant', async () => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue(User.create({
        tenantId: TENANT_ID,
        email: 'member@example.com',
        profileType: 'NATURAL_PERSON',
      })),
    }
    const invitations = { create: jest.fn() }
    const handler = new CreateInvitationHandler(invitations as any, users as any)

    await expect(handler.execute(new CreateInvitationCommand(
      TENANT_ID, 'member@example.com', ROLE_ID, INVITER_ID,
    ))).rejects.toBeInstanceOf(ConflictException)
    expect(invitations.create).not.toHaveBeenCalled()
  })

  it('resolves only the SHA-256 token hash and never returns the token in the preview', async () => {
    const token = 'b'.repeat(43)
    const stored = invitation(createHash('sha256').update(token).digest('hex'))
    const invitations = { findByTokenHash: jest.fn().mockResolvedValue(stored) }
    const handler = new GetInvitationByTokenHandler(invitations as any)

    const result = await handler.execute(new GetInvitationByTokenQuery(token))
    expect(invitations.findByTokenHash).toHaveBeenCalledWith(stored.tokenHash)
    expect(result).not.toHaveProperty('token')
    expect(result).not.toHaveProperty('tokenHash')
    expect(result.email).toBe(stored.email)
  })

  it('rejects malformed invitation tokens before accessing persistence', async () => {
    const invitations = { findByTokenHash: jest.fn() }
    const handler = new GetInvitationByTokenHandler(invitations as any)
    await expect(handler.execute(new GetInvitationByTokenQuery('not-a-token'))).rejects.toThrow()
    expect(invitations.findByTokenHash).not.toHaveBeenCalled()
  })

  it('hashes a strong password before preparing an inactive member account', async () => {
    const token = 'c'.repeat(43)
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const stored = invitation(tokenHash)
    const invitations = {
      findByTokenHash: jest.fn().mockResolvedValue(stored),
      prepareAcceptance: jest.fn().mockResolvedValue({
        tenantId: TENANT_ID, invitationId: INVITATION_ID, userId: 'member-id', roleId: ROLE_ID,
      }),
    }
    const handler = new PrepareInvitationAcceptanceHandler(invitations as any)

    await handler.execute(new PrepareInvitationAcceptanceCommand(
      token, 'Ana', 'Pérez', 'StrongPassword123!',
    ))

    const args = invitations.prepareAcceptance.mock.calls[0]
    expect(args[0]).toBe(INVITATION_ID)
    expect(args[1]).toBe(tokenHash)
    expect(args[4]).not.toBe('StrongPassword123!')
    await expect(bcrypt.compare('StrongPassword123!', args[4])).resolves.toBe(true)
  })

  it('rejects a weak password without creating a member', async () => {
    const token = 'd'.repeat(43)
    const stored = invitation(createHash('sha256').update(token).digest('hex'))
    const invitations = {
      findByTokenHash: jest.fn().mockResolvedValue(stored),
      prepareAcceptance: jest.fn(),
    }
    const handler = new PrepareInvitationAcceptanceHandler(invitations as any)

    await expect(handler.execute(new PrepareInvitationAcceptanceCommand(
      token, 'Ana', 'Pérez', 'weak',
    ))).rejects.toThrow('Password must have 12 to 72 UTF-8 bytes')
    expect(invitations.prepareAcceptance).not.toHaveBeenCalled()
  })
})
