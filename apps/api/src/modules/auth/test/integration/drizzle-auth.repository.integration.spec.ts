import { DrizzleAuthRepository } from '../../infrastructure/drizzle-auth.repository'
import { Session } from '../../domain/entities/session.entity'
import * as dbModule from '@crm/database'

describe('DrizzleAuthRepository - Persistence Integration Tests', () => {
  let repository: DrizzleAuthRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        sessions: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        mfaMethods: {
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleAuthRepository()
  })

  it('should find session by refresh token hash with tenant scoping', async () => {
    mockDb.query.sessions.findFirst.mockResolvedValue({
      id: 'sess-1',
      tenantId: 'tenant-1',
      userId: 'u-1',
      refreshTokenHash: 'sha256_hash_value',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
    })

    const session = await repository.findSessionByRefreshTokenHash('tenant-1', 'sha256_hash_value')

    expect(session).not.toBeNull()
    expect(session?.userId).toBe('u-1')
    expect(session?.refreshTokenHash).toBe('sha256_hash_value')
  })

  it('should save session entity into sessions table', async () => {
    const session = Session.create({
      tenantId: 'tenant-1',
      userId: 'u-1',
      refreshTokenHash: 'token_hash',
      expiresAt: new Date(Date.now() + 3600000),
    })

    await repository.saveSession(session)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
