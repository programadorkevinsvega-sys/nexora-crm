import { Injectable } from '@nestjs/common'
import { UserRepository, UserFilter, PaginatedUsers } from '../domain/repositories/user.repository'
import { User } from '../domain/entities/user.entity'
import { NaturalPersonProfile } from '../domain/entities/natural-person-profile.entity'
import { LegalEntityProfile } from '../domain/entities/legal-entity-profile.entity'
import { UserOAuthLink } from '../domain/entities/user-oauth-link.entity'
import { UserMobileDevice } from '../domain/entities/user-mobile-device.entity'
import { UsersCoreDrizzleHelper } from './users-core.drizzle'
import { UsersProfilesDevicesDrizzleHelper } from './users-profiles-devices.drizzle'

@Injectable()
export class DrizzleUserRepository extends UserRepository {
  findById(tenantId: string, id: string): Promise<User | null> { return UsersCoreDrizzleHelper.findById(tenantId, id) }
  findByEmail(tenantId: string, email: string): Promise<User | null> { return UsersCoreDrizzleHelper.findByEmail(tenantId, email) }
  list(tenantId: string, filter: UserFilter): Promise<PaginatedUsers> { return UsersCoreDrizzleHelper.list(tenantId, filter) }
  save(user: User): Promise<void> { return UsersCoreDrizzleHelper.save(user) }
  delete(tenantId: string, id: string): Promise<void> { return UsersCoreDrizzleHelper.delete(tenantId, id) }

  getNaturalPersonProfile(profileId: string): Promise<NaturalPersonProfile | null> {
    return UsersProfilesDevicesDrizzleHelper.getNaturalPersonProfile(profileId)
  }
  getLegalEntityProfile(profileId: string): Promise<LegalEntityProfile | null> {
    return UsersProfilesDevicesDrizzleHelper.getLegalEntityProfile(profileId)
  }
  saveNaturalPersonProfile(profile: NaturalPersonProfile): Promise<void> {
    return UsersProfilesDevicesDrizzleHelper.saveNaturalPersonProfile(profile)
  }
  saveLegalEntityProfile(profile: LegalEntityProfile): Promise<void> {
    return UsersProfilesDevicesDrizzleHelper.saveLegalEntityProfile(profile)
  }
  findOAuthLink(userId: string, providerName: string): Promise<UserOAuthLink | null> {
    return UsersProfilesDevicesDrizzleHelper.findOAuthLink(userId, providerName)
  }
  listOAuthLinks(userId: string): Promise<UserOAuthLink[]> {
    return UsersProfilesDevicesDrizzleHelper.listOAuthLinks(userId)
  }
  saveOAuthLink(link: UserOAuthLink): Promise<void> {
    return UsersProfilesDevicesDrizzleHelper.saveOAuthLink(link)
  }
  deleteOAuthLink(id: string): Promise<void> {
    return UsersProfilesDevicesDrizzleHelper.deleteOAuthLink(id)
  }
  findDeviceById(deviceId: string): Promise<UserMobileDevice | null> {
    return UsersProfilesDevicesDrizzleHelper.findDeviceById(deviceId)
  }
  findDeviceByIdentifier(userId: string, deviceIdentifier: string): Promise<UserMobileDevice | null> {
    return UsersProfilesDevicesDrizzleHelper.findDeviceByIdentifier(userId, deviceIdentifier)
  }
  listDevices(userId: string): Promise<UserMobileDevice[]> {
    return UsersProfilesDevicesDrizzleHelper.listDevices(userId)
  }
  saveDevice(device: UserMobileDevice): Promise<void> {
    return UsersProfilesDevicesDrizzleHelper.saveDevice(device)
  }
  deleteDevice(deviceId: string): Promise<void> {
    return UsersProfilesDevicesDrizzleHelper.deleteDevice(deviceId)
  }
}
