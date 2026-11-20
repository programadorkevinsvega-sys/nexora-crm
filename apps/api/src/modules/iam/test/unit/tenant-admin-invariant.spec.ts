import { ConflictException } from '@nestjs/common'
import { assertTenantHasRemainingAdmin } from '../../infrastructure/tenant-admin-invariant'

describe('tenant administrator invariant', () => {
  it('allows demoting one administrator when another remains', () => {
    expect(() => assertTenantHasRemainingAdmin(['admin-a', 'admin-b'], 'admin-a', false)).not.toThrow()
  })

  it('rejects demoting the last administrator', () => {
    expect(() => assertTenantHasRemainingAdmin(['admin-a'], 'admin-a', false))
      .toThrow(ConflictException)
  })

  it('allows retaining the admin role', () => {
    expect(() => assertTenantHasRemainingAdmin(['admin-a'], 'admin-a', true)).not.toThrow()
  })

  it('rejects removing the admin role from the last administrator', () => {
    expect(() => assertTenantHasRemainingAdmin(['admin-a'], 'admin-a', false))
      .toThrow('The tenant must retain at least one administrator')
  })
})
