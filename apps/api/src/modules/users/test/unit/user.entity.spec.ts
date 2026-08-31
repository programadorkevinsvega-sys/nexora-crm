import { User } from '../../domain/entities/user.entity'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

describe('User Entity', () => {
  describe('create', () => {
    it('should create a natural person user', () => {
      const user = User.create({
        tenantId: TENANT_ID,
        email: 'test@example.com',
        profileType: 'NATURAL_PERSON',
      })

      expect(user.id).toBeDefined()
      expect(user.tenantId).toBe(TENANT_ID)
      expect(user.email).toBe('test@example.com')
      expect(user.profileType).toBe('NATURAL_PERSON')
      expect(user.status).toBe('ACTIVE')
      expect(user.isEmailVerified).toBe(false)
      expect(user.failedLoginAttempts).toBe(0)
      expect(user.passwordHash).toBeNull()
      expect(user.managerId).toBeNull()
      expect(user.naturalPersonProfile).toBeNull()
      expect(user.legalEntityProfile).toBeNull()
    })

    it('should create a legal entity user', () => {
      const user = User.create({
        tenantId: TENANT_ID,
        email: 'company@example.com',
        profileType: 'LEGAL_ENTITY',
      })

      expect(user.profileType).toBe('LEGAL_ENTITY')
    })

    it('should normalize email to lowercase', () => {
      const user = User.create({
        tenantId: TENANT_ID,
        email: 'TEST@EXAMPLE.COM',
        profileType: 'NATURAL_PERSON',
      })

      expect(user.email).toBe('test@example.com')
    })

    it('should set passwordHash when provided', () => {
      const user = User.create({
        tenantId: TENANT_ID,
        email: 'test@example.com',
        passwordHash: '$2b$10$hashedpassword',
        profileType: 'NATURAL_PERSON',
      })

      expect(user.passwordHash).toBe('$2b$10$hashedpassword')
    })

    it('should set managerId when provided', () => {
      const managerId = crypto.randomUUID()
      const user = User.create({
        tenantId: TENANT_ID,
        email: 'test@example.com',
        profileType: 'NATURAL_PERSON',
        managerId,
      })

      expect(user.managerId).toBe(managerId)
    })
  })

  describe('update', () => {
    it('should update email', () => {
      const user = User.create({ tenantId: TENANT_ID, email: 'old@example.com', profileType: 'NATURAL_PERSON' })
      const updated = user.update({ email: 'new@example.com' })
      expect(updated.email).toBe('new@example.com')
      expect(updated.id).toBe(user.id)
    })

    it('should update status', () => {
      const user = User.create({ tenantId: TENANT_ID, email: 'test@example.com', profileType: 'NATURAL_PERSON' })
      const updated = user.update({ status: 'INACTIVE' })
      expect(updated.status).toBe('INACTIVE')
    })

    it('should update managerId to null', () => {
      const user = User.create({
        tenantId: TENANT_ID, email: 'test@example.com', profileType: 'NATURAL_PERSON',
        managerId: crypto.randomUUID(),
      })
      const updated = user.update({ managerId: null })
      expect(updated.managerId).toBeNull()
    })
  })

  describe('markEmailVerified', () => {
    it('should mark email as verified', () => {
      const user = User.create({ tenantId: TENANT_ID, email: 'test@example.com', profileType: 'NATURAL_PERSON' })
      const verified = user.markEmailVerified()
      expect(verified.isEmailVerified).toBe(true)
    })
  })

  describe('incrementFailedAttempts', () => {
    it('should increment failed login attempts', () => {
      const user = User.create({ tenantId: TENANT_ID, email: 'test@example.com', profileType: 'NATURAL_PERSON' })
      expect(user.failedLoginAttempts).toBe(0)
      const incremented = user.incrementFailedAttempts()
      expect(incremented.failedLoginAttempts).toBe(1)
    })
  })

  describe('lockUntil', () => {
    it('should lock user until specified date', () => {
      const user = User.create({ tenantId: TENANT_ID, email: 'test@example.com', profileType: 'NATURAL_PERSON' })
      const lockDate = new Date(Date.now() + 3600000)
      const locked = user.lockUntil(lockDate)
      expect(locked.lockedUntil).toEqual(lockDate)
    })
  })

  describe('recordLogin', () => {
    it('should reset failed attempts and record login time', () => {
      const user = User.create({ tenantId: TENANT_ID, email: 'test@example.com', profileType: 'NATURAL_PERSON' })
      const withAttempts = user.incrementFailedAttempts().incrementFailedAttempts()
      expect(withAttempts.failedLoginAttempts).toBe(2)

      const loggedIn = withAttempts.recordLogin()
      expect(loggedIn.failedLoginAttempts).toBe(0)
      expect(loggedIn.lockedUntil).toBeNull()
      expect(loggedIn.lastLoginAt).toBeDefined()
    })
  })

  describe('delete (soft)', () => {
    it('should set status to INACTIVE', () => {
      const user = User.create({ tenantId: TENANT_ID, email: 'test@example.com', profileType: 'NATURAL_PERSON' })
      const deleted = user.update({ status: 'INACTIVE' })
      expect(deleted.status).toBe('INACTIVE')
    })
  })
})
