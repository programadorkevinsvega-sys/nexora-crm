import { createHash } from 'crypto'
import { ConflictException } from '@nestjs/common'
import { CreatePortalInvitationHandler } from '../../application/commands/create-portal-invitation.handler'
import { PreviewPortalInvitationHandler } from '../../application/commands/preview-portal-invitation.handler'
import { AcceptPortalInvitationHandler } from '../../application/commands/accept-portal-invitation.handler'
import { CustomerPortalAccessRepository, PortalInvitation } from '../../domain/repositories/customer-portal-access.repository'

describe('Customer portal access handlers', () => {
  const mocks = {
    findAccountByContact: jest.fn(),
    listInvitations: jest.fn(),
    createInvitation: jest.fn(),
    findInvitationByTokenHash: jest.fn(),
    acceptInvitation: jest.fn(),
  }
  const repository = mocks as unknown as CustomerPortalAccessRepository

  beforeEach(() => jest.clearAllMocks())

  it('creates a 7-day invitation and persists only the SHA-256 token hash', async () => {
    mocks.findAccountByContact.mockResolvedValue(null)
    mocks.listInvitations.mockResolvedValue([])
    mocks.createInvitation.mockImplementation(async (input: Omit<PortalInvitation, 'acceptedAt' | 'createdAt'>) => ({
      ...input, acceptedAt: null, createdAt: new Date(),
    }))
    const handler = new CreatePortalInvitationHandler(repository)
    const result = await handler.execute({
      tenantId: '11111111-1111-4111-8111-111111111111',
      contactId: '22222222-2222-4222-8222-222222222222',
      email: 'CLIENT@example.com',
      invitedBy: '33333333-3333-4333-8333-333333333333',
    })
    expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(result.invitation.email).toBe('client@example.com')
    expect(result.invitation.tokenHash).toBe(createHash('sha256').update(result.token).digest('hex'))
    expect(result.invitation.tokenHash).not.toBe(result.token)
    expect(result.invitation.expiresAt.getTime()).toBeGreaterThan(Date.now() + 6 * 24 * 60 * 60 * 1000)
  })

  it('does not create a second portal identity for a contact that already has an account', async () => {
    mocks.findAccountByContact.mockResolvedValue({
      id: 'account', tenantId: 'tenant', contactId: 'contact', email: 'client@example.com',
      passwordHash: 'hash', status: 'ACTIVE', refreshTokenHash: null, refreshTokenExpiresAt: null,
    })
    const handler = new CreatePortalInvitationHandler(repository)
    await expect(handler.execute({
      tenantId: 'tenant', contactId: 'contact', email: 'client@example.com', invitedBy: 'admin',
    })).rejects.toBeInstanceOf(ConflictException)
    expect(mocks.createInvitation).not.toHaveBeenCalled()
  })

  it('rejects malformed and expired public invitation tokens', async () => {
    const handler = new PreviewPortalInvitationHandler(repository)
    await expect(handler.execute('bad-token')).rejects.toBeInstanceOf(ConflictException)
    const token = 'a'.repeat(43)
    mocks.findInvitationByTokenHash.mockResolvedValue({
      id: 'id', tenantId: 'tenant', contactId: 'contact', email: 'client@example.com',
      status: 'PENDING', expiresAt: new Date(Date.now() - 1000),
    })
    await expect(handler.execute(token)).rejects.toBeInstanceOf(ConflictException)
    expect(mocks.findInvitationByTokenHash).toHaveBeenCalledWith(
      createHash('sha256').update(token).digest('hex'),
    )
  })

  it('enforces the password policy before creating a portal account', async () => {
    const handler = new AcceptPortalInvitationHandler(repository)
    await expect(handler.execute('a'.repeat(43), 'weakpass')).rejects.toThrow('Password must have')
    expect(mocks.acceptInvitation).not.toHaveBeenCalled()
  })
})
