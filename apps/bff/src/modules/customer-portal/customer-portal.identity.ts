import { ForbiddenException } from '@nestjs/common'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'

export interface CustomerPortalIdentity {
  tenantId: string
  contactId: string
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Only a signed, explicitly scoped customer-portal JWT may resolve a contact.
 * Never accept tenantId/contactId from query strings, headers or request bodies.
 */
export function resolveCustomerPortalIdentity(user?: AuthenticatedUser): CustomerPortalIdentity {
  if (
    user?.customerPortal !== true ||
    typeof user.tenantId !== 'string' ||
    !UUID_PATTERN.test(user.tenantId) ||
    typeof user.contactId !== 'string' ||
    !UUID_PATTERN.test(user.contactId)
  ) {
    throw new ForbiddenException('A verified customer-portal identity is required')
  }

  return {
    tenantId: user.tenantId,
    contactId: user.contactId,
  }
}
