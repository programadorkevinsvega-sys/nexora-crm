import { Test, TestingModule } from '@nestjs/testing'
import { DeveloperController } from '../../interfaces/http/developer.controller'
import {
  CreateApiKeyHandler,
  RevokeApiKeyHandler,
  CreateWebhookEndpointHandler,
  DeleteWebhookEndpointHandler,
  DispatchWebhookEventHandler,
} from '../../application/commands/developer.handlers'
import {
  ListApiKeysHandler,
  ListWebhookEndpointsHandler,
  ListDeliveryLogsHandler,
} from '../../application/queries/developer.handlers'
import { ApiKey } from '../../domain/entities/api-key.entity'
import { WebhookEndpoint } from '../../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog } from '../../domain/entities/webhook-delivery-log.entity'

describe('DeveloperController (e2e - NestJS TestingModule)', () => {
  let controller: DeveloperController

  const tenantId = '00000000-0000-0000-0000-000000000001'
  const keyId = '00000000-0000-0000-0000-000000000002'
  const endpointId = '00000000-0000-0000-0000-000000000003'

  const mockCreateKeyHandler = { execute: jest.fn() }
  const mockListKeysHandler = { execute: jest.fn() }
  const mockRevokeKeyHandler = { execute: jest.fn() }
  const mockCreateWebhookHandler = { execute: jest.fn() }
  const mockListWebhooksHandler = { execute: jest.fn() }
  const mockDeleteWebhookHandler = { execute: jest.fn() }
  const mockListLogsHandler = { execute: jest.fn() }
  const mockDispatchWebhookHandler = { execute: jest.fn() }

  const fakeKey = new ApiKey(
    keyId,
    tenantId,
    'Zapier Sync',
    'hash123',
    'nex_live_1234...',
    ['contacts:read', 'contacts:write'],
    true,
    null,
    null,
    new Date(),
    new Date(),
  )

  const fakeEndpoint = new WebhookEndpoint(
    endpointId,
    tenantId,
    'Billing Hook',
    'https://billing.acme.com',
    'whsec_123',
    ['deal.won', 'payment.received'],
    true,
    new Date(),
    new Date(),
  )

  const fakeLog = new WebhookDeliveryLog(
    'log-1',
    tenantId,
    endpointId,
    'deal.won',
    { dealId: 'deal-10' },
    200,
    'OK',
    45,
    1,
    'SUCCESS',
    new Date(),
    new Date(),
  )

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeveloperController],
      providers: [
        { provide: CreateApiKeyHandler, useValue: mockCreateKeyHandler },
        { provide: ListApiKeysHandler, useValue: mockListKeysHandler },
        { provide: RevokeApiKeyHandler, useValue: mockRevokeKeyHandler },
        { provide: CreateWebhookEndpointHandler, useValue: mockCreateWebhookHandler },
        { provide: ListWebhookEndpointsHandler, useValue: mockListWebhooksHandler },
        { provide: DeleteWebhookEndpointHandler, useValue: mockDeleteWebhookHandler },
        { provide: ListDeliveryLogsHandler, useValue: mockListLogsHandler },
        { provide: DispatchWebhookEventHandler, useValue: mockDispatchWebhookHandler },
      ],
    }).compile()

    controller = module.get<DeveloperController>(DeveloperController)
    jest.clearAllMocks()
  })

  // ── API Keys ──────────────────────────────────────────
  describe('POST /developer/api-keys', () => {
    it('should create an API key and return raw key once', async () => {
      mockCreateKeyHandler.execute.mockResolvedValue({
        ...fakeKey,
        rawKey: 'nex_live_secretkey123',
      })

      const res = await controller.createApiKey(
        { name: 'Zapier Sync', scopes: ['contacts:read', 'contacts:write'] },
        tenantId,
      )

      expect(res.rawKey).toBe('nex_live_secretkey123')
      expect(res.name).toBe('Zapier Sync')
      expect(mockCreateKeyHandler.execute).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET /developer/api-keys', () => {
    it('should return list of API keys for the tenant', async () => {
      mockListKeysHandler.execute.mockResolvedValue([fakeKey])

      const res = await controller.listApiKeys(tenantId)

      expect(res).toHaveLength(1)
      expect(res[0].id).toBe(keyId)
      expect(mockListKeysHandler.execute).toHaveBeenCalledTimes(1)
    })
  })

  describe('DELETE /developer/api-keys/:id', () => {
    it('should revoke an API key', async () => {
      mockRevokeKeyHandler.execute.mockResolvedValue(undefined)

      const res = await controller.revokeApiKey(keyId, tenantId)

      expect(res.success).toBe(true)
      expect(mockRevokeKeyHandler.execute).toHaveBeenCalledTimes(1)
    })
  })

  // ── Webhooks ──────────────────────────────────────────
  describe('POST /developer/webhooks', () => {
    it('should create a webhook endpoint', async () => {
      mockCreateWebhookHandler.execute.mockResolvedValue(fakeEndpoint)

      const res = await controller.createWebhook(
        { name: 'Billing Hook', url: 'https://billing.acme.com', events: ['deal.won'] },
        tenantId,
      )

      expect(res.id).toBe(endpointId)
      expect(res.name).toBe('Billing Hook')
    })
  })

  describe('GET /developer/webhooks', () => {
    it('should list webhook endpoints', async () => {
      mockListWebhooksHandler.execute.mockResolvedValue([fakeEndpoint])

      const res = await controller.listWebhooks(tenantId)

      expect(res).toHaveLength(1)
      expect(res[0].url).toBe('https://billing.acme.com')
    })
  })

  describe('GET /developer/webhooks/:id/deliveries', () => {
    it('should list delivery logs for endpoint', async () => {
      mockListLogsHandler.execute.mockResolvedValue([fakeLog])

      const res = await controller.listDeliveryLogs(endpointId, tenantId)

      expect(res).toHaveLength(1)
      expect(res[0].status).toBe('SUCCESS')
    })
  })

  describe('POST /developer/webhooks/dispatch', () => {
    it('should dispatch test webhook event', async () => {
      mockDispatchWebhookHandler.execute.mockResolvedValue({ dispatched: 1 })

      const res = await controller.dispatchWebhook(
        { event: 'deal.won', payload: { dealId: 'deal-1' } },
        tenantId,
      )

      expect(res.dispatched).toBe(1)
    })
  })
})
