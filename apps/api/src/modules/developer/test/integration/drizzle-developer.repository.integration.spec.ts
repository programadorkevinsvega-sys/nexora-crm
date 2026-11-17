import { DrizzleDeveloperRepository } from '../../infrastructure/drizzle-developer.repository'
import { ApiKey } from '../../domain/entities/api-key.entity'
import { WebhookEndpoint } from '../../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog } from '../../domain/entities/webhook-delivery-log.entity'
import * as dbModule from '@crm/database'

describe('DrizzleDeveloperRepository - Integration Tests', () => {
  let repository: DrizzleDeveloperRepository
  let mockDb: any
  const tenantId = '00000000-0000-0000-0000-000000000001'

  beforeEach(() => {
    mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleDeveloperRepository()
  })

  it('should insert and return a created ApiKey entity', async () => {
    const rawKey = ApiKey.generateRawKey()
    const key = await repository.createApiKey(tenantId, 'Stripe Sync', ['contacts:write'], rawKey)

    expect(key.name).toBe('Stripe Sync')
    expect(key.keyHash).toBe(ApiKey.hashKey(rawKey))
    expect(mockDb.insert).toHaveBeenCalled()
  })

  it('should list ApiKeys from database', async () => {
    const rawKey = ApiKey.generateRawKey()
    const row = {
      id: 'key-1',
      tenantId,
      name: 'Mobile App',
      keyHash: ApiKey.hashKey(rawKey),
      keyPrefix: 'nex_live_1234...',
      scopes: ['contacts:read', 'deals:read'],
      isActive: true,
      lastUsedAt: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([row]),
        }),
      }),
    })

    const keys = await repository.listApiKeys(tenantId)

    expect(keys).toHaveLength(1)
    expect(keys[0].name).toBe('Mobile App')
    expect(keys[0].hasScope('contacts:read')).toBe(true)
  })

  it('should validate active API key successfully', async () => {
    const rawKey = ApiKey.generateRawKey()
    const hash = ApiKey.hashKey(rawKey)

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            {
              id: 'key-10',
              tenantId,
              keyHash: hash,
              scopes: ['contacts:read'],
              isActive: true,
              expiresAt: null,
            },
          ]),
        }),
      }),
    })

    const res = await repository.validateApiKey(rawKey)

    expect(res.valid).toBe(true)
    if (res.valid) {
      expect(res.tenantId).toBe(tenantId)
      expect(res.keyId).toBe('key-10')
    }
  })

  it('should return valid: false for unknown or invalid key', async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    })

    const res = await repository.validateApiKey('invalid_key')

    expect(res.valid).toBe(false)
  })

  it('should create and list WebhookEndpoints', async () => {
    const ep = await repository.createWebhookEndpoint(
      tenantId,
      'ERP Webhook',
      'https://erp.com/hook',
      ['deal.won'],
    )

    expect(ep.name).toBe('ERP Webhook')
    expect(ep.secret.startsWith('whsec_')).toBe(true)
    expect(mockDb.insert).toHaveBeenCalled()
  })

  it('should log and update delivery log', async () => {
    const log = WebhookDeliveryLog.create({
      tenantId,
      endpointId: 'ep-1',
      event: 'deal.won',
      payload: {},
    })

    await repository.logDelivery(log)
    expect(mockDb.insert).toHaveBeenCalled()

    await repository.updateDeliveryLog(log.id, 'SUCCESS', 200, 'OK', 150)
    expect(mockDb.update).toHaveBeenCalled()
  })
})
