import { eq, and } from 'drizzle-orm'
import {
  getDb,
  naturalPersonProfiles as naturalPersonTable,
  legalEntityProfiles as legalEntityTable,
  userOauthLinks as oauthLinksTable,
  userMobileDevices as devicesTable,
} from '@crm/database'
import { NaturalPersonProfile } from '../domain/entities/natural-person-profile.entity'
import { LegalEntityProfile } from '../domain/entities/legal-entity-profile.entity'
import { UserOAuthLink } from '../domain/entities/user-oauth-link.entity'
import { UserMobileDevice, DevicePlatform } from '../domain/entities/user-mobile-device.entity'

function toDevicePlatform(value: string): DevicePlatform {
  if (value === 'IOS' || value === 'ANDROID' || value === 'WEB' || value === 'OTHER') return value
  throw new Error(`Unsupported device platform: ${value}`)
}

export class UsersProfilesDevicesDrizzleHelper {
  private static get db() { return getDb() }

  static async getNaturalPersonProfile(profileId: string): Promise<NaturalPersonProfile | null> {
    const row = await this.db.query.naturalPersonProfiles.findFirst({
      where: eq(naturalPersonTable.id, profileId),
    })
    if (!row) return null

    return new NaturalPersonProfile(
      row.id, row.tenantId, row.firstName, row.lastName,
      row.identificationNumber, row.phone, row.countryCode,
      row.preferredLanguage ?? 'es',
      row.timezone ?? 'America/Bogota',
      row.avatarUrl, row.createdAt, row.updatedAt,
    )
  }

  static async getLegalEntityProfile(profileId: string): Promise<LegalEntityProfile | null> {
    const row = await this.db.query.legalEntityProfiles.findFirst({
      where: eq(legalEntityTable.id, profileId),
    })
    if (!row) return null

    return new LegalEntityProfile(
      row.id, row.tenantId, row.legalName, row.commercialName,
      row.taxId, row.legalAddress, row.countryCode, row.isActive ?? true,
      row.createdAt, row.updatedAt,
    )
  }

  static async saveNaturalPersonProfile(profile: NaturalPersonProfile): Promise<void> {
    const values = {
      id: profile.id,
      tenantId: profile.tenantId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      identificationNumber: profile.identificationNumber,
      phone: profile.phone,
      countryCode: profile.countryCode,
      preferredLanguage: profile.preferredLanguage,
      timezone: profile.timezone,
      avatarUrl: profile.avatarUrl,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
    await this.db.insert(naturalPersonTable).values(values).onConflictDoUpdate({
      target: naturalPersonTable.id,
      set: values,
    })
  }

  static async saveLegalEntityProfile(profile: LegalEntityProfile): Promise<void> {
    const values = {
      id: profile.id,
      tenantId: profile.tenantId,
      legalName: profile.legalName,
      commercialName: profile.commercialName,
      taxId: profile.taxId,
      legalAddress: profile.legalAddress,
      countryCode: profile.countryCode,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
    await this.db.insert(legalEntityTable).values(values).onConflictDoUpdate({
      target: legalEntityTable.id,
      set: values,
    })
  }

  static async findOAuthLink(userId: string, providerName: string): Promise<UserOAuthLink | null> {
    const row = await this.db.query.userOauthLinks.findFirst({
      where: and(
        eq(oauthLinksTable.userId, userId),
        eq(oauthLinksTable.providerName, providerName),
      ),
    })
    if (!row) return null

    return new UserOAuthLink(row.id, row.userId, row.providerName, row.providerUserId, row.createdAt)
  }

  static async listOAuthLinks(userId: string): Promise<UserOAuthLink[]> {
    const rows = await this.db.query.userOauthLinks.findMany({
      where: eq(oauthLinksTable.userId, userId),
    })
    return rows.map((r) => new UserOAuthLink(r.id, r.userId, r.providerName, r.providerUserId, r.createdAt))
  }

  static async saveOAuthLink(link: UserOAuthLink): Promise<void> {
    await this.db.insert(oauthLinksTable).values({
      id: link.id,
      userId: link.userId,
      providerName: link.providerName,
      providerUserId: link.providerUserId,
      createdAt: link.createdAt,
    })
  }

  static async deleteOAuthLink(id: string): Promise<void> {
    await this.db.delete(oauthLinksTable).where(eq(oauthLinksTable.id, id))
  }

  static async findDeviceById(deviceId: string): Promise<UserMobileDevice | null> {
    const row = await this.db.query.userMobileDevices.findFirst({
      where: eq(devicesTable.id, deviceId),
    })
    if (!row) return null
    return this.deviceToDomain(row)
  }

  static async findDeviceByIdentifier(userId: string, deviceIdentifier: string): Promise<UserMobileDevice | null> {
    const row = await this.db.query.userMobileDevices.findFirst({
      where: and(
        eq(devicesTable.userId, userId),
        eq(devicesTable.deviceIdentifier, deviceIdentifier),
      ),
    })
    if (!row) return null
    return this.deviceToDomain(row)
  }

  static async listDevices(userId: string): Promise<UserMobileDevice[]> {
    const rows = await this.db.query.userMobileDevices.findMany({
      where: eq(devicesTable.userId, userId),
    })
    return rows.map((r) => this.deviceToDomain(r))
  }

  static async saveDevice(device: UserMobileDevice): Promise<void> {
    const values = {
      id: device.id,
      tenantId: device.tenantId,
      userId: device.userId,
      deviceIdentifier: device.deviceIdentifier,
      platform: device.platform,
      deviceModel: device.deviceModel,
      osVersion: device.osVersion,
      pushNotificationToken: device.pushNotificationToken,
      isTrustedDevice: device.isTrustedDevice,
      lastActiveAt: device.lastActiveAt,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    }
    await this.db.insert(devicesTable).values(values).onConflictDoUpdate({
      target: devicesTable.id,
      set: values,
    })
  }

  static async deleteDevice(deviceId: string): Promise<void> {
    await this.db.delete(devicesTable).where(eq(devicesTable.id, deviceId))
  }

  private static deviceToDomain(row: typeof devicesTable.$inferSelect): UserMobileDevice {
    return new UserMobileDevice(
      row.id, row.tenantId, row.userId,
      row.deviceIdentifier, toDevicePlatform(row.platform),
      row.deviceModel, row.osVersion,
      row.pushNotificationToken, row.isTrustedDevice,
      row.lastActiveAt, row.createdAt, row.updatedAt,
    )
  }
}
