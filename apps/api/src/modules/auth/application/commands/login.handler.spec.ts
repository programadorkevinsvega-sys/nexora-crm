import { UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { authenticator } from 'otplib'
import { MfaMethod } from '../../domain/entities/mfa-method.entity'
import { LoginCommand } from './auth.commands'
import { LoginHandler } from './login.handler'

describe('LoginHandler MFA enforcement', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL
  const tenantId = 'tenant-id'
  const userId = 'user-id'
  const email = 'agent@example.com'
  const password = 'correct-password'

  let handler: LoginHandler
  let passwordHash: string
  let secret: string
  let repository: any
  let outbox: any
  let jwtService: any
  let userLookup: any

  beforeEach(async () => {
    delete process.env.DATABASE_URL
    jest.clearAllMocks()
    passwordHash = await bcrypt.hash(password, 4)
    secret = authenticator.generateSecret()

    repository = {
      findMfaMethodsByUser: jest.fn(),
      findUnusedRecoveryCodesByUser: jest.fn().mockResolvedValue([]),
      saveRecoveryCode: jest.fn().mockResolvedValue(undefined),
      saveSession: jest.fn().mockResolvedValue(undefined),
    }
    outbox = { publish: jest.fn().mockResolvedValue(undefined) }
    jwtService = { signAsync: jest.fn().mockResolvedValue('unexpected-token') }
    userLookup = {
      findByTenantAndEmail: jest.fn().mockResolvedValue({
        id: userId,
        email,
        passwordHash,
      }),
    }

    repository.findMfaMethodsByUser.mockResolvedValue([
      new MfaMethod('method-id', tenantId, userId, 'TOTP', secret, true, true, new Date()),
    ])
    handler = new LoginHandler(repository, outbox, jwtService, userLookup)
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
