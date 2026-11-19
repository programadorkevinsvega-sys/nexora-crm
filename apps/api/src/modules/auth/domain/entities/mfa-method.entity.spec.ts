import { MfaMethod } from './mfa-method.entity'

describe('MfaMethod', () => {
  it('keeps a new enrolment inactive until proof of possession', () => {
    const method = MfaMethod.create({
      tenantId: 'tenant-id',
      userId: 'user-id',
      type: 'TOTP',
      secret: 'test-secret',
      isPrimary: true,
    })

    expect(method.isActive).toBe(false)
  })

  it('activates only after successful verification and can be deactivated later', () => {
    const pending = MfaMethod.create({
      tenantId: 'tenant-id',
      userId: 'user-id',
      type: 'TOTP',
      secret: 'test-secret',
      isPrimary: true,
    })

    const active = pending.activate()
    expect(active.isActive).toBe(true)
    expect(active.isPrimary).toBe(true)

    const disabled = active.deactivate()
    expect(disabled.isActive).toBe(false)
    expect(disabled.isPrimary).toBe(true)
  })
})
