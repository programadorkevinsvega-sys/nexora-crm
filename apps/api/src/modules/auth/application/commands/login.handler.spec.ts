import { UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { authenticator } from 'otplib'
import { MfaMethod } from '../../domain/entities/mfa-method.entity'
import { LoginCommand } from './auth.commands'
import { LoginHandler } from './login.handler'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { JwtService } from '@nestjs/jwt'
import { UserLookupService } from './user-lookup.service'

describe('LoginHandler MFA enforcement', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL
  const tenantId = 'tenant-id'
  const userId = 'user-id'
  const email = 'agent@example.com'
  const password = 'correct-password'

  let handler: LoginHandler
  let passwordHash: string
  let secret: string
  type RepositoryMock = jest.Mocked<Pick<AuthRepository, 'findMfaMethodsByUser' | 'findUnusedRecoveryCodesByUser' | 'saveRecoveryCode' | 'saveSession'>>
  type OutboxMock = jest.Mocked<Pick<OutboxService, 'publish'>>
  type JwtMock = jest.Mocked<Pick<JwtService, 'signAsync'>>
  type UserLookupMock = jest.Mocked<Pick<UserLookupService, 'findByTenantAndEmail' | 'findByEmail'>>
  let repository: RepositoryMock
  let outbox: OutboxMock
  let jwtService: JwtMock
  let userLookup: UserLookupMock

  beforeEach(async () => {
    delete process.env.DATABASE_URL
    jest.clearAllMocks()
    passwordHash = await bcrypt.hash(password, 4)
    secret = authenticator.generateSecret()

    repository = {
      findMfaMethodsByUser: jest.fn<ReturnType<AuthRepository['findMfaMethodsByUser']>, Parameters<AuthRepository['findMfaMethodsByUser']>>(),
      findUnusedRecoveryCodesByUser: jest.fn<ReturnType<AuthRepository['findUnusedRecoveryCodesByUser']>, Parameters<AuthRepository['findUnusedRecoveryCodesByUser']>>().mockResolvedValue([]),
      saveRecoveryCode: jest.fn<ReturnType<AuthRepository['saveRecoveryCode']>, Parameters<AuthRepository['saveRecoveryCode']>>().mockResolvedValue(undefined),
      saveSession: jest.fn<ReturnType<AuthRepository['saveSession']>, Parameters<AuthRepository['saveSession']>>().mockResolvedValue(undefined),
    }
    outbox = { publish: jest.fn<ReturnType<OutboxService['publish']>, Parameters<OutboxService['publish']>>().mockResolvedValue(undefined) }
    jwtService = { signAsync: jest.fn<ReturnType<JwtService['signAsync']>, Parameters<JwtService['signAsync']>>().mockResolvedValue('unexpected-token') }
    userLookup = {
      findByTenantAndEmail: jest.fn<ReturnType<UserLookupService['findByTenantAndEmail']>, Parameters<UserLookupService['findByTenantAndEmail']>>().mockResolvedValue({
        id: userId,
        email,
        passwordHash,
      }),
    }

    repository.findMfaMethodsByUser.mockResolvedValue([
      new MfaMethod('method-id', tenantId, userId, 'TOTP', secret, true, true, new Date()),
    ])
    handler = new LoginHandler(repository as unknown as AuthRepository, outbox as unknown as OutboxService, jwtService as unknown as JwtService, userLookup as unknown as UserLookupService)
  })

  afterAll(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = originalDatabaseUrl
  })

  it('returns an MFA challenge without issuing tokens or creating a session', async () => {
    const result = await handler.execute(new LoginCommand(tenantId, email, password))

    expect(result).toMatchObject({
      mfaRequired: true,
      mfaType: 'TOTP',
      user: { id: userId, tenantId },
    })
    expect(result).not.toHaveProperty('accessToken')
    expect(result).not.toHaveProperty('refreshToken')
    expect(jwtService.signAsync).not.toHaveBeenCalled()
    expect(repository.saveSession).not.toHaveBeenCalled()
    expect(outbox.publish).not.toHaveBeenCalled()
  })

  it('rejects an invalid second factor without issuing tokens or creating a session', async () => {
    await expect(
      handler.execute(new LoginCommand(tenantId, email, password, undefined, undefined, undefined, 'not-a-valid-code')),
    ).rejects.toBeInstanceOf(UnauthorizedException)

    expect(jwtService.signAsync).not.toHaveBeenCalled()
    expect(repository.saveSession).not.toHaveBeenCalled()
    expect(outbox.publish).not.toHaveBeenCalled()
  })

  it('issues a session only after a valid TOTP code', async () => {
    const validCode = authenticator.generate(secret)
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token')

    const result = await handler.execute(
      new LoginCommand(tenantId, email, password, undefined, undefined, undefined, validCode),
    )

    expect(result).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      mfaRequired: false,
    })
    expect(repository.saveSession).toHaveBeenCalledTimes(1)
    expect(outbox.publish).toHaveBeenCalledTimes(1)
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2)
  })
})
