import { DeveloperBffController } from './developer.bff.controller'
import { DeveloperBffService } from './developer.bff.service'
import type {
  ApiKey,
  CreatedApiKey,
  WebhookEndpoint,
  WebhookDeliveryLog,
} from '@crm/contracts'

describe('DeveloperBffController - Unit Tests', () => {
  let controller: DeveloperBffController
  let mockService: jest.Mocked<DeveloperBffService>

  const tenantId = '00000000-0000-0000-0000-000000000001'
  const keyId = '00000000-0000-0000-0000-000000000002'
  const endpointId = '00000000-0000-0000-0000-000000000003'

  beforeEach(() => {
    mockService = {
      createApiKey: jest.fn(),
      listApiKeys: jest.fn(),
      revokeApiKey: jest.fn(),
      createWebhookEndpoint: jest.fn(),
      listWebhookEndpoints: jest.fn(),
      deleteWebhookEndpoint: jest.fn(),
      getDeliveryLogs: jest.fn(),
      dispatchTestEvent: jest.fn(),
    } as any

    controller = new DeveloperBffController(mockService)
  })

  it('POST /api/developer/api-keys should create API key', async () => {
    const created: CreatedApiKey = {
      id: keyId,
      name: 'Stripe API',
      keyPrefix: 'nex_live_1234...',
      scopes: ['contacts:read'],
      isActive: true,
      lastUsedAt: null,
      expiresAt: null,
      createdAt: new Date().toISOString(),
      rawKey: 'nex_live_1234567890abcdef',
    }
    mockService.createApiKey.mockResolvedValue(created)

    const res = await controller.createApiKey(
      { name: 'Stripe API', scopes: ['contacts:read'] },
      tenantId,
    )

    expect(res.rawKey).toBe('nex_live_1234567890abcdef')
    expect(mockService.createApiKey).toHaveBeenCalledWith(
      { name: 'Stripe API', scopes: ['contacts:read'] },
      tenantId,
    )
  })

  it('GET /api/developer/api-keys should list API keys', async () => {
    const key: ApiKey = {
      id: keyId,
      name: 'Stripe API',
      keyPrefix: 'nex_live_1234...',
      scopes: ['contacts:read'],
      isActive: true,
      lastUsedAt: null,
      expiresAt: null,
      createdAt: new Date().toISOString(),
    }
    mockService.listApiKeys.mockResolvedValue([key])

    const res = await controller.listApiKeys(tenantId)

    expect(res).toHaveLength(1)
    expect(res[0].id).toBe(keyId)
  })

  it('DELETE /api/developer/api-keys/:id should revoke API key', async () => {
    mockService.revokeApiKey.mockResolvedValue(undefined)

    const res = await controller.revokeApiKey(keyId, tenantId)

    expect(res.success).toBe(true)
    expect(mockService.revokeApiKey).toHaveBeenCalledWith(keyId, tenantId)
  })

  it('POST /api/developer/webhooks should create webhook endpoint', async () => {
    const ep: WebhookEndpoint = {
      id: endpointId,
      name: 'Slack Hook',
      url: 'https://hooks.slack.com',
      events: ['deal.won'],
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    mockService.createWebhookEndpoint.mockResolvedValue(ep)

    const res = await controller.createWebhook(
      { name: 'Slack Hook', url: 'https://hooks.slack.com', events: ['deal.won'] },
      tenantId,
    )

    expect(res.name).toBe('Slack Hook')
  })

  it('GET /api/developer/webhooks/:id/deliveries should get delivery logs', async () => {
    const log: WebhookDeliveryLog = {
      id: 'log-1',
      event: 'deal.won',
      status: 'SUCCESS',
      responseStatus: 200,
      attempt: 1,
      durationMs: 34,
      deliveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    mockService.getDeliveryLogs.mockResolvedValue([log])

    const res = await controller.getDeliveryLogs(endpointId, tenantId)

    expect(res).toHaveLength(1)
    expect(res[0].status).toBe('SUCCESS')
  })
})
