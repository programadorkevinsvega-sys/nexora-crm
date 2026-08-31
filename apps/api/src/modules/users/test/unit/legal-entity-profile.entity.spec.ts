import { LegalEntityProfile } from '../../domain/entities/legal-entity-profile.entity'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'
const PROFILE_ID = crypto.randomUUID()

describe('LegalEntityProfile Entity', () => {
  describe('create', () => {
    it('should create a profile with required fields', () => {
      const profile = LegalEntityProfile.create({
        id: PROFILE_ID,
        tenantId: TENANT_ID,
        legalName: 'Acme Corp',
        taxId: 'NIT123456789',
      })

      expect(profile.id).toBe(PROFILE_ID)
      expect(profile.legalName).toBe('Acme Corp')
      expect(profile.taxId).toBe('NIT123456789')
      expect(profile.isActive).toBe(true)
      expect(profile.commercialName).toBeNull()
      expect(profile.legalAddress).toBeNull()
      expect(profile.countryCode).toBeNull()
    })

    it('should set optional fields when provided', () => {
      const profile = LegalEntityProfile.create({
        id: PROFILE_ID,
        tenantId: TENANT_ID,
        legalName: 'Tech Solutions SA',
        commercialName: 'TechSol',
        taxId: 'RFC123456789',
        legalAddress: 'Calle 123, Ciudad',
        countryCode: 'MX',
      })

      expect(profile.commercialName).toBe('TechSol')
      expect(profile.legalAddress).toBe('Calle 123, Ciudad')
      expect(profile.countryCode).toBe('MX')
    })
  })

  describe('update', () => {
    it('should update profile fields', () => {
      const profile = LegalEntityProfile.create({
        id: PROFILE_ID,
        tenantId: TENANT_ID,
        legalName: 'Acme Corp',
        taxId: 'NIT123456789',
      })

      const updated = profile.update({ legalName: 'Acme Corp International' })
      expect(updated.legalName).toBe('Acme Corp International')
      expect(updated.id).toBe(profile.id)
    })

    it('should deactivate profile', () => {
      const profile = LegalEntityProfile.create({
        id: PROFILE_ID,
        tenantId: TENANT_ID,
        legalName: 'Acme Corp',
        taxId: 'NIT123456789',
      })

      const updated = profile.update({ isActive: false })
      expect(updated.isActive).toBe(false)
    })
  })
})
