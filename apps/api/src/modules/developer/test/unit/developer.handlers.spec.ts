import {
  CreateApiKeyHandler,
  RevokeApiKeyHandler,
  CreateWebhookEndpointHandler,
  DispatchWebhookEventHandler,
} from '../../application/commands/developer.handlers'
import {
  ListApiKeysHandler,
  ValidateApiKeyHandler,
  ListDeliveryLogsHandler,
} from '../../application/queries/developer.handlers'
import {
  CreateApiKeyCommand,
  RevokeApiKeyCommand,
  CreateWebhookEndpointCommand,
  DispatchWebhookEventCommand,
} from '../../application/commands/developer.commands'
import {
  ListApiKeysQuery,
  ValidateApiKeyQuery,
  ListDeliveryLogsQuery,
} from '../../application/queries/developer.queries'
import { DeveloperRepository } from '../../domain/repositories/developer.repository'
import { ApiKey } from '../../domain/entities/api-key.entity'
import { WebhookEndpoint } from '../../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog } from '../../domain/entities/webhook-delivery-log.entity'

describe('Developer Handlers - Unit Tests', () => {
  let repo: jest.Mocked<DeveloperRepository>
  const tenantId = '00000000-0000-0000-0000-000000000001'

  beforeEach(() => {
    repo = {
      createApiKey: jest.fn(),
      listApiKeys: jest.fn(),
      revokeApiKey: jest.fn(),
      deleteApiKey: jest.fn().mockResolvedValue(undefined),
      validateApiKey: jest.fn(),
      markKeyUsed: jest.fn().mockResolvedValue(undefined),
      createWebhookEndpoint: jest.fn(),
      listWebhookEndpoints: jest.fn(),
      deleteWebhookEndpoint: jest.fn(),
      getEndpointsForEvent: jest.fn(),
      logDelivery: jest.fn().mockResolvedValue(undefined),
      updateDeliveryLog: jest.fn().mockResolvedValue(undefined),
      listDeliveryLogs: jest.fn(),
    }
  })

  it('CreateApiKeyHandler should generate raw key and save entity', async () => {
    const rawKey = ApiKey.generateRawKey()
    const key = ApiKey.create({ tenantId, name: 'Prod Key', scopes: ['contacts:read'], rawKey })
    repo.createApiKey.mockResolvedValue(key)

    const handler = new CreateApiKeyHandler(repo)
    const result = await handler.execute(new CreateApiKeyCommand(tenantId, 'Prod Key', ['contacts:read']))

    expect(result.name).toBe('Prod Key')
    expect(result.rawKey.startsWith('nex_live_')).toBe(true)
    expect(repo.createApiKey).toHaveBeenCalled()
  })

  it('RevokeApiKeyHandler should call repo.revokeApiKey', async () => {
    repo.revokeApiKey.mockResolvedValue(undefined)
    const handler = new RevokeApiKeyHandler(repo)
    await handler.execute(new RevokeApiKeyCommand(tenantId, 'key-123'))
    expect(repo.revokeApiKey).toHaveBeenCalledWith(tenantId, 'key-123')
  })

  it('ValidateApiKeyHandler should return validation result and mark key used', async () => {
    repo.validateApiKey.mockResolvedValue({
      valid: true,
      tenantId,
      scopes: ['contacts:read', 'deals:read'],
      keyId: 'key-123',
    })

    const handler = new ValidateApiKeyHandler(repo)
    const res = await handler.execute(new ValidateApiKeyQuery('nex_live_validkey'))

    expect(res.valid).toBe(true)
    if (res.valid) {
      expect(res.tenantId).toBe(tenantId)
      expect(res.scopes).toContain('contacts:read')
    }
    expect(repo.markKeyUsed).toHaveBeenCalledWith('key-123')
  })

  it('CreateWebhookEndpointHandler should create webhook endpoint', async () => {
    const ep = WebhookEndpoint.create({ tenantId, name: 'Billing', url: 'https://pay.acme.com', events: ['deal.won'] })
    repo.createWebhookEndpoint.mockResolvedValue(ep)

    const handler = new CreateWebhookEndpointHandler(repo)
    const res = await handler.execute(new CreateWebhookEndpointCommand(tenantId, 'Billing', 'https://pay.acme.com', ['deal.won']))

    expect(res.name).toBe('Billing')
    expect(res.url).toBe('https://pay.acme.com')
  })

  it('DispatchWebhookEventHandler should find endpoints and log delivery', async () => {
    const ep = WebhookEndpoint.create({ tenantId, name: 'Billing', url: 'https://pay.acme.com', events: ['deal.won'] })
    repo.getEndpointsForEvent.mockResolvedValue([ep])

    const handler = new DispatchWebhookEventHandler(repo)
    const res = await handler.execute(new DispatchWebhookEventCommand(tenantId, 'deal.won', { dealId: 'deal-1' }))

    expect(res.dispatched).toBe(1)
    expect(repo.logDelivery).toHaveBeenCalled()
  })

  it('ListApiKeysHandler should return keys from repo', async () => {
    const key = ApiKey.create({ tenantId, name: 'Test Key', scopes: ['tickets:read'], rawKey: 'nex_live_test' })
    repo.listApiKeys.mockResolvedValue([key])

    const handler = new ListApiKeysHandler(repo)
    const res = await handler.execute(new ListApiKeysQuery(tenantId))

    expect(res).toHaveLength(1)
    expect(res[0].name).toBe('Test Key')
  })

  it('ListDeliveryLogsHandler should return logs from repo', async () => {
    const log = WebhookDeliveryLog.create({ tenantId, endpointId: 'ep-1', event: 'contact.created', payload: {} })
    repo.listDeliveryLogs.mockResolvedValue([log])

    const handler = new ListDeliveryLogsHandler(repo)
    const res = await handler.execute(new ListDeliveryLogsQuery(tenantId, 'ep-1'))

    expect(res).toHaveLength(1)
    expect(res[0].event).toBe('contact.created')
  })
})
