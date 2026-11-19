import { ForbiddenException } from '@nestjs/common'
import { resolveCustomerPortalIdentity } from './customer-portal.identity'

describe('resolveCustomerPortalIdentity', () => {
  const tenantId = '11111111-1111-4111-8111-111111111111'
  const contactId = '22222222-2222-4222-8222-222222222222'

  it('rejects a regular CRM user even when a contact ID is supplied', () => {
    expect(() => resolveCustomerPortalIdentity({
      userId: '33333333-3333-4333-8333-333333333333',
      sub: '33333333-3333-4333-8333-333333333333',
      tenantId,
      contactId,
      customerPortal: false,
    })).toThrow(ForbiddenException)
  })

  it('rejects a customer portal token without a contact identity', () => {
    expect(() => resolveCustomerPortalIdentity({
      userId: '33333333-3333-4333-8333-333333333333',
      sub: '33333333-3333-4333-8333-333333333333',
      tenantId,
      customerPortal: true,
    })).toThrow(ForbiddenException)
  })

  it('rejects malformed tenant and contact identifiers', () => {
    expect(() => resolveCustomerPortalIdentity({
      userId: '33333333-3333-4333-8333-333333333333',
      sub: '33333333-3333-4333-8333-333333333333',
      tenantId,
      contactId: 'not-a-uuid',
      customerPortal: true,
    })).toThrow(ForbiddenException)
  })

  it('returns only signed tenant and contact claims for a portal token', () => {
    expect(resolveCustomerPortalIdentity({
      userId: '33333333-3333-4333-8333-333333333333',
      sub: '33333333-3333-4333-8333-333333333333',
      tenantId,
      contactId,
      customerPortal: true,
    })).toEqual({ tenantId, contactId })
  })
})
