import { NaturalPersonProfile } from '../../domain/entities/natural-person-profile.entity'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'
const PROFILE_ID = crypto.randomUUID()

describe('NaturalPersonProfile Entity', () => {
  describe('create', () => {
    it('should create a profile with required fields', () => {
      const profile = NaturalPersonProfile.create({
        id: PROFILE_ID,
        tenantId: TENANT_ID,
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(profile.id).toBe(PROFILE_ID)
      expect(profile.firstName).toBe('John')
      expect(profile.lastName).toBe('Doe')
      expect(profile.preferredLanguage).toBe('es')
      expect(profile.timezone).toBe('America/Bogota')
      expect(profile.identificationNumber).toBeNull()
      expect(profile.phone).toBeNull()
      expect(profile.avatarUrl).toBeNull()
    })

    it('should set optional fields when provided', () => {
      const profile = NaturalPersonProfile.create({
        id: PROFILE_ID,
        tenantId: TENANT_ID,
        firstName: 'Jane',
        lastName: 'Smith',
        identificationNumber: 'DNI12345678',
        phone: '+57 300 123 4567',
        countryCode: 'CO',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatarUrl: 'https://example.com/avatar.jpg',
      })

      expect(profile.identificationNumber).toBe('DNI12345678')
      expect(profile.phone).toBe('+57 300 123 4567')
      expect(profile.countryCode).toBe('CO')
      expect(profile.preferredLanguage).toBe('en')
      expect(profile.timezone).toBe('America/New_York')
      expect(profile.avatarUrl).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('update', () => {
    it('should update profile fields', () => {
      const profile = NaturalPersonProfile.create({
        id: PROFILE_ID,
        tenantId: TENANT_ID,
        firstName: 'John',
        lastName: 'Doe',
      })

      const updated = profile.update({ firstName: 'Johnny', lastName: 'Updated' })
      expect(updated.firstName).toBe('Johnny')
      expect(updated.lastName).toBe('Updated')
      expect(updated.id).toBe(profile.id)
    })

    it('should set fields to null when explicitly passed', () => {
      const profile = NaturalPersonProfile.create({
        id: PROFILE_ID,
        tenantId: TENANT_ID,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+57 300 123 4567',
      })

      const updated = profile.update({ phone: null })
      expect(updated.phone).toBeNull()
    })
  })
})
