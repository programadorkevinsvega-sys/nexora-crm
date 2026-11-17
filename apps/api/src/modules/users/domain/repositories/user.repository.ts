import { User } from '../entities/user.entity'
import { NaturalPersonProfile } from '../entities/natural-person-profile.entity'
import { LegalEntityProfile } from '../entities/legal-entity-profile.entity'
import { UserOAuthLink } from '../entities/user-oauth-link.entity'
import { UserMobileDevice } from '../entities/user-mobile-device.entity'

export interface UserFilter {
  search?: string
  status?: string
  profileType?: string
  cursor?: string
  limit: number
}

export interface PaginatedUsers {
  data: User[]
  nextCursor: string | null
}

export abstract class UserRepository {
  abstract findById(tenantId: string, id: string): Promise<User | null>
  abstract findByEmail(tenantId: string, email: string): Promise<User | null>
  abstract list(tenantId: string, filter: UserFilter): Promise<PaginatedUsers>
  abstract save(user: User): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>

  abstract getNaturalPersonProfile(profileId: string): Promise<NaturalPersonProfile | null>
  abstract getLegalEntityProfile(profileId: string): Promise<LegalEntityProfile | null>
  abstract saveNaturalPersonProfile(profile: NaturalPersonProfile): Promise<void>
  abstract saveLegalEntityProfile(profile: LegalEntityProfile): Promise<void>

  abstract findOAuthLink(userId: string, providerName: string): Promise<UserOAuthLink | null>
  abstract listOAuthLinks(userId: string): Promise<UserOAuthLink[]>
  abstract saveOAuthLink(link: UserOAuthLink): Promise<void>
  abstract deleteOAuthLink(id: string): Promise<void>

  abstract findDeviceById(deviceId: string): Promise<UserMobileDevice | null>
  abstract findDeviceByIdentifier(userId: string, deviceIdentifier: string): Promise<UserMobileDevice | null>
  abstract listDevices(userId: string): Promise<UserMobileDevice[]>
  abstract saveDevice(device: UserMobileDevice): Promise<void>
  abstract deleteDevice(deviceId: string): Promise<void>
}
