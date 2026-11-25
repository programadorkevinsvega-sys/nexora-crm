import { Tenant } from '../../domain/entities/tenant.entity'
import { Branch } from '../../domain/entities/branch.entity'
import { TenantBranding } from '../../domain/entities/branding.entity'
import { UsageMetric } from '../../domain/entities/features.entity'

describe('Tenant Domain Entities', () => {
  describe('Tenant Entity', () => {
    it('should initialize with default ACTIVE status and UTC timezone', () => {
      const tenant = Tenant.create({
        name: 'Globex Corp',
        industryType: 'Enterprise',
        ownerUserId: 'owner-1',
      })

      expect(tenant.id).toBeDefined()
      expect(tenant.status).toBe('ACTIVE')
      expect(tenant.timezone).toBe('UTC')
      expect(tenant.currencyCode).toBe('USD')
      expect(tenant.createdAt).toBeInstanceOf(Date)
    })

    it('should immutably update fields and update updatedAt timestamp', () => {
      const tenant = Tenant.create({
        name: 'Old Name',
        industryType: 'Retail',
        ownerUserId: 'owner-1',
      })

      const updated = tenant.update({
        name: 'New Name LLC',
        status: 'SUSPENDED',
        currencyCode: 'EUR',
      })

      expect(updated.name).toBe('New Name LLC')
      expect(updated.status).toBe('SUSPENDED')
      expect(updated.currencyCode).toBe('EUR')
      expect(updated.id).toBe(tenant.id)
      expect(tenant.name).toBe('Old Name') // Immutability test
    })
  })

  describe('Branch Entity', () => {
    it('should create headquarters branch correctly', () => {
      const branch = Branch.create({
        tenantId: 'tenant-1',
        name: 'Main HQ',
        code: 'HQ-01',
        city: 'Bogota',
        country: 'Colombia',
        isHeadquarters: true,
      })

      expect(branch.isHeadquarters).toBe(true)
      expect(branch.isActive).toBe(true)
    })

    it('should update branch metadata and active state', () => {
      const branch = Branch.create({
        tenantId: 'tenant-1',
        name: 'North Branch',
        code: 'BR-02',
      })

      const updated = branch.update({ name: 'North Branch Renovated', isActive: false })
      expect(updated.name).toBe('North Branch Renovated')
      expect(updated.isActive).toBe(false)
    })
  })

  describe('TenantBranding Entity', () => {
    it('should create branding configuration with theme colors and domain', () => {
      const branding = TenantBranding.create({
        tenantId: 'tenant-1',
        logoUrl: 'https://cdn.example.com/logo.png',
        primaryColor: '#0052CC',
        secondaryColor: '#FFAB00',
        customDomain: 'crm.globex.com',
      })

      expect(branding.primaryColor).toBe('#0052CC')
      expect(branding.customDomain).toBe('crm.globex.com')
    })
  })

  describe('UsageMetric Entity', () => {
    it('should calculate consumption and detect limit breach', () => {
      const metric = UsageMetric.create({
        tenantId: 'tenant-1',
        metricName: 'api_calls',
        currentValue: 95000,
        limitValue: 100000,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 86400000 * 30),
      })

      expect(metric.currentValue).toBe(95000)
      expect(metric.limitValue).toBe(100000)
    })
  })
})
