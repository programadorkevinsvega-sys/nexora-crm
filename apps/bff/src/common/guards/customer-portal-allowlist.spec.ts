import { isAllowedCustomerPortalPath } from './jwt-auth.guard'

describe('customer portal JWT allowlist', () => {
  it('allows only the scoped portal identity and ticket operations', () => {
    expect(isAllowedCustomerPortalPath('GET', '/api/customer-portal/me')).toBe(true)
    expect(isAllowedCustomerPortalPath('POST', '/api/customer-portal/tickets')).toBe(true)
  })

  it('allows only owned-ticket detail and public conversation methods', () => {
    const ticketId = '44444444-4444-4444-8444-444444444444'
    expect(isAllowedCustomerPortalPath('GET', `/api/customer-portal/tickets/${ticketId}`)).toBe(true)
    expect(isAllowedCustomerPortalPath('GET', `/api/customer-portal/tickets/${ticketId}/replies`)).toBe(true)
    expect(isAllowedCustomerPortalPath('POST', `/api/customer-portal/tickets/${ticketId}/replies`)).toBe(true)
    expect(isAllowedCustomerPortalPath('PUT', `/api/customer-portal/tickets/${ticketId}/replies`)).toBe(false)
    expect(isAllowedCustomerPortalPath('POST', `/api/customer-portal/tickets/${ticketId}`)).toBe(false)
    expect(isAllowedCustomerPortalPath('GET', '/api/customer-portal/tickets/not-a-uuid')).toBe(false)
  })

  it('allows read-only public knowledge-base operations', () => {
    expect(isAllowedCustomerPortalPath('GET', '/api/kb/categories')).toBe(true)
    expect(isAllowedCustomerPortalPath('GET', '/api/kb/articles')).toBe(true)
    expect(isAllowedCustomerPortalPath('GET', '/api/kb/articles/guia-inicio')).toBe(true)
  })

  it('rejects tenant-wide CRM operations and all unrelated write operations', () => {
    expect(isAllowedCustomerPortalPath('GET', '/api/contacts')).toBe(false)
    expect(isAllowedCustomerPortalPath('GET', '/api/tickets')).toBe(false)
    expect(isAllowedCustomerPortalPath('GET', '/api/quotes')).toBe(false)
    expect(isAllowedCustomerPortalPath('POST', '/api/kb/articles')).toBe(false)
    expect(isAllowedCustomerPortalPath('POST', '/api/customer-portal/me')).toBe(false)
    expect(isAllowedCustomerPortalPath('GET', '/api/customer-portal/tickets')).toBe(false)
  })
})
