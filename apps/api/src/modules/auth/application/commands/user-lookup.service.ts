export interface UserLookup {
  id: string
  email: string
  passwordHash: string | null
}

export abstract class UserLookupService {
  abstract findByTenantAndEmail(tenantId: string, email: string): Promise<UserLookup | null>
  abstract findById(tenantId: string, userId: string): Promise<Pick<UserLookup, 'id' | 'passwordHash'> | null>
  findByEmail?(email: string): Promise<(UserLookup & { tenantId?: string }) | null>
}
