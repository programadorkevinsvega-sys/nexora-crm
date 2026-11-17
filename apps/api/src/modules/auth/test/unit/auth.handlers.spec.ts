/* eslint-disable @typescript-eslint/no-explicit-any */
import * as bcrypt from 'bcrypt'
import { LoginHandler, UserLookupService } from '../../application/commands/auth.handlers'
import { GetPasswordPolicyHandler } from '../../application/queries/auth.handlers'
import { LoginCommand } from '../../application/commands/auth.commands'
import { GetPasswordPolicyQuery } from '../../application/queries/auth.queries'
import { Session } from '../../domain/entities/session.entity'
import { MfaMethod } from '../../domain/entities/mfa-method.entity'
import { PasswordPolicy } from '../../domain/entities/password-policy.entity'
import { IpRestriction } from '../../domain/entities/ip-restriction.entity'
import { OAuthProvider } from '../../domain/entities/oauth-provider.entity'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'
const USER_ID = '00000000-0000-0000-0000-000000000002'

class MockUserLookupService extends UserLookupService {
  findByTenantAndEmail = jest.fn<Promise<any>, [string, string]>()
  findById = jest.fn<Promise<any>, [string, string]>()
}

describe('LoginHandler', () => {
  let handler: LoginHandler
  let mockRepo: any
  let mockOutbox: any
  let mockJwt: any
  let mockUserLookup: MockUserLookupService

  beforeEach(() => {
    mockRepo = {
      findMfaMethodsByUser: jest.fn().mockResolvedValue([]),
      saveSession: jest.fn().mockResolvedValue(undefined),
    }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
    mockJwt = { signAsync: jest.fn().mockResolvedValue('mock-token') }
    mockUserLookup = new MockUserLookupService()
    handler = new LoginHandler(mockRepo, mockOutbox, mockJwt, mockUserLookup)
  })

  it('should return tokens on successful login', async () => {
    mockUserLookup.findByTenantAndEmail.mockResolvedValue({
      id: USER_ID,
      email: 'test@example.com',
      passwordHash: '$2b$10$mockhash',
    })
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)

    const result = await handler.execute(
      new LoginCommand(TENANT_ID, 'test@example.com', 'password123'),
    )

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.sessionId).toBeDefined()
    expect(mockRepo.saveSession).toHaveBeenCalledTimes(1)
  })

  it('should throw when user not found', async () => {
    mockUserLookup.findByTenantAndEmail.mockResolvedValue(null)

    await expect(handler.execute(
      new LoginCommand(TENANT_ID, 'unknown@test.com', 'password123'),
    )).rejects.toThrow('Invalid credentials')
  })

  it('should throw when password is invalid', async () => {
    mockUserLookup.findByTenantAndEmail.mockResolvedValue({
      id: USER_ID,
      email: 'test@test.com',
      passwordHash: '$2b$10$mockhash',
    })
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never)

    await expect(handler.execute(
      new LoginCommand(TENANT_ID, 'test@test.com', 'wrongpassword'),
    )).rejects.toThrow('Invalid credentials')
  })

  it('should require MFA when user has active MFA and no MFA code provided', async () => {
    mockUserLookup.findByTenantAndEmail.mockResolvedValue({
      id: USER_ID,
      email: 'test@test.com',
      passwordHash: '$2b$10$mockhash',
    })
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)
    mockRepo.findMfaMethodsByUser.mockResolvedValue([
      MfaMethod.create({ tenantId: TENANT_ID, userId: USER_ID, type: 'TOTP', secret: 'secret', isPrimary: true }),
    ])

    const result = await handler.execute(
      new LoginCommand(TENANT_ID, 'test@test.com', 'password'),
    )

    expect(result.mfaRequired).toBe(true)
    expect(result.accessToken).toBeDefined()
  })
})

describe('GetPasswordPolicyHandler', () => {
  let handler: GetPasswordPolicyHandler
  let mockRepo: any

  beforeEach(() => {
    mockRepo = { getPasswordPolicy: jest.fn() }
    handler = new GetPasswordPolicyHandler(mockRepo)
  })

  it('should return policy from repo when exists', async () => {
    const policy = PasswordPolicy.default(TENANT_ID)
    mockRepo.getPasswordPolicy.mockResolvedValue(policy)
    const result = await handler.execute(new GetPasswordPolicyQuery(TENANT_ID))
    expect(result.tenantId).toBe(TENANT_ID)
    expect(result.minLength).toBe(8)
  })

  it('should return default policy when none exists', async () => {
    mockRepo.getPasswordPolicy.mockResolvedValue(null)
    const result = await handler.execute(new GetPasswordPolicyQuery(TENANT_ID))
    expect(result.tenantId).toBe(TENANT_ID)
    expect(result).toBeInstanceOf(PasswordPolicy)
  })
})

describe('MfaMethod', () => {
  it('should create a TOTP method', () => {
    const method = MfaMethod.create({
      tenantId: TENANT_ID,
      userId: USER_ID,
      type: 'TOTP',
      secret: 'JBSWY3DPEHPK3PXP',
    })
    expect(method.type).toBe('TOTP')
    expect(method.isActive).toBe(true)
    expect(method.isPrimary).toBe(false)
  })

  it('should set primary', () => {
    const method = MfaMethod.create({ tenantId: TENANT_ID, userId: USER_ID, type: 'SMS', secret: '123456' })
    const primary = method.setPrimary()
    expect(primary.isPrimary).toBe(true)
  })

  it('should deactivate', () => {
    const method = MfaMethod.create({ tenantId: TENANT_ID, userId: USER_ID, type: 'EMAIL', secret: '123456' })
    const deactivated = method.deactivate()
    expect(deactivated.isActive).toBe(false)
  })
})

describe('Session', () => {
  it('should create a session', () => {
    const session = Session.create({
      tenantId: TENANT_ID,
      userId: USER_ID,
      refreshTokenHash: 'hash123',
      expiresAt: new Date(Date.now() + 3600000),
    })
    expect(session.isRevoked).toBe(false)
    expect(session.isExpired()).toBe(false)
  })

  it('should revoke', () => {
    const session = Session.create({ tenantId: TENANT_ID, userId: USER_ID, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() + 3600000) })
    const revoked = session.revoke()
    expect(revoked.isRevoked).toBe(true)
  })

  it('should detect expired', () => {
    const session = Session.create({ tenantId: TENANT_ID, userId: USER_ID, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() - 3600000) })
    expect(session.isExpired()).toBe(true)
  })
})

describe('PasswordPolicy', () => {
  it('should create default', () => {
    const policy = PasswordPolicy.default(TENANT_ID)
    expect(policy.minLength).toBe(8)
    expect(policy.requireUppercase).toBe(true)
    expect(policy.requireNumbers).toBe(true)
    expect(policy.requireSymbols).toBe(true)
  })

  it('should validate password', () => {
    const policy = PasswordPolicy.default(TENANT_ID)
    expect(policy.validate('short')).toHaveLength(4)
    expect(policy.validate('Valid1Pass!')).toHaveLength(0)
  })

  it('should update', () => {
    const policy = PasswordPolicy.default(TENANT_ID)
    const updated = policy.update({ minLength: 12 })
    expect(updated.minLength).toBe(12)
    expect(updated.requireUppercase).toBe(true)
  })
})

describe('IpRestriction', () => {
  it('should create allow rule', () => {
    const r = IpRestriction.create({ tenantId: TENANT_ID, ipAddress: '192.168.1.1', type: 'ALLOW' })
    expect(r.type).toBe('ALLOW')
    expect(r.userId).toBeNull()
  })

  it('should create deny rule for specific user', () => {
    const r = IpRestriction.create({ tenantId: TENANT_ID, userId: USER_ID, ipAddress: '10.0.0.1', type: 'DENY', description: 'Block bad actor' })
    expect(r.type).toBe('DENY')
    expect(r.userId).toBe(USER_ID)
    expect(r.description).toBe('Block bad actor')
  })
})

describe('OAuthProvider', () => {
  it('should create provider', () => {
    const p = OAuthProvider.create({
      tenantId: TENANT_ID,
      providerName: 'google',
      clientId: 'client-123',
      clientSecret: 'secret-456',
    })
    expect(p.providerName).toBe('google')
    expect(p.isActive).toBe(true)
  })

  it('should deactivate', () => {
    const p = OAuthProvider.create({ tenantId: TENANT_ID, providerName: 'github', clientId: 'c', clientSecret: 's' })
    const deactivated = p.deactivate()
    expect(deactivated.isActive).toBe(false)
  })
})
