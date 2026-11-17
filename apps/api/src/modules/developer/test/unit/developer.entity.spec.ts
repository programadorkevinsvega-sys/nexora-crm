import { ApiKey } from '../../domain/entities/api-key.entity'
import { WebhookEndpoint } from '../../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog } from '../../domain/entities/webhook-delivery-log.entity'

describe('Developer Domain Entities - Unit Tests', () => {
  const tenantId = '00000000-0000-0000-0000-000000000001'

  describe('ApiKey Entity', () => {
    it('should generate a raw key with nex_live_ prefix and 64 hex chars', () => {
      const rawKey = ApiKey.generateRawKey()
      expect(rawKey.startsWith('nex_live_')).toBe(true)
      expect(rawKey.length).toBe('nex_live_'.length + 64)
    })

    it('should hash a key using SHA-256', () => {
      const rawKey = 'nex_live_testkey1234567890abcdef'
      const hash = ApiKey.hashKey(rawKey)
      expect(hash).toHaveLength(64)
      expect(ApiKey.hashKey(rawKey)).toBe(hash) // Deterministic
    })

    it('should create an ApiKey entity correctly', () => {
      const rawKey = ApiKey.generateRawKey()
      const key = ApiKey.create({
        tenantId,
        name: 'Zapier Integration',
        scopes: ['contacts:read', 'contacts:write'],
        rawKey,
      })

      expect(key.id).toBeDefined()
      expect(key.tenantId).toBe(tenantId)
      expect(key.name).toBe('Zapier Integration')
      expect(key.keyHash).toBe(ApiKey.hashKey(rawKey))
      expect(key.isActive).toBe(true)
      expect(key.lastUsedAt).toBeNull()
      expect(key.isExpired()).toBe(false)
      expect(key.hasScope('contacts:read')).toBe(true)
      expect(key.hasScope('deals:read')).toBe(false)
    })

    it('should correctly detect expired keys', () => {
      const pastDate = new Date(Date.now() - 10000)
      const rawKey = ApiKey.generateRawKey()
      const expiredKey = ApiKey.create({
        tenantId,
        name: 'Old Key',
        scopes: ['deals:read'],
        rawKey,
        expiresAt: pastDate,
      })

      expect(expiredKey.isExpired()).toBe(true)
    })
  })

  describe('WebhookEndpoint Entity', () => {
    it('should generate HMAC secret with whsec_ prefix', () => {
      const secret = WebhookEndpoint.generateSecret()
      expect(secret.startsWith('whsec_')).toBe(true)
      expect(secret.length).toBe('whsec_'.length + 64)
    })

    it('should create a WebhookEndpoint entity and verify event listeners', () => {
      const ep = WebhookEndpoint.create({
        tenantId,
        name: 'ERP Invoicing Webhook',
        url: 'https://erp.acme.com/api/webhooks',
        events: ['deal.won', 'contract.signed'],
      })

      expect(ep.id).toBeDefined()
      expect(ep.name).toBe('ERP Invoicing Webhook')
      expect(ep.url).toBe('https://erp.acme.com/api/webhooks')
      expect(ep.secret.startsWith('whsec_')).toBe(true)
      expect(ep.isActive).toBe(true)
      expect(ep.listensTo('deal.won')).toBe(true)
      expect(ep.listensTo('contact.created')).toBe(false)
    })
  })

  describe('WebhookDeliveryLog Entity', () => {
    it('should create a WebhookDeliveryLog with PENDING status', () => {
      const log = WebhookDeliveryLog.create({
        tenantId,
        endpointId: 'ep-001',
        event: 'deal.won',
        payload: { dealId: 'deal-10', amount: 50000 },
      })

      expect(log.id).toBeDefined()
      expect(log.tenantId).toBe(tenantId)
      expect(log.endpointId).toBe('ep-001')
      expect(log.event).toBe('deal.won')
      expect(log.status).toBe('PENDING')
      expect(log.attempt).toBe(1)
      expect(log.responseStatus).toBeNull()
      expect(log.deliveredAt).toBeNull()
    })
  })
})
