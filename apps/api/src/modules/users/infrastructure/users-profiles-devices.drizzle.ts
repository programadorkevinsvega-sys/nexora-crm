/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { UserMobileDevice } from '../domain/entities/user-mobile-device.entity'

export class UsersProfilesDevicesDrizzleHelper {
  private static get db() { return getDb() }

  static async getNaturalPersonProfile(profileId: string): Promise<NaturalPersonProfile | null> {
    const row = await this.db.query.naturalPersonProfiles.findFirst({
      where: eq(naturalPersonTable.id, profileId) as any,
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
      where: eq(legalEntityTable.id, profileId) as any,
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
    await this.db.insert(naturalPersonTable).values(values as any).onConflictDoUpdate({
      target: naturalPersonTable.id,
      set: values as any,
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
    await this.db.insert(legalEntityTable).values(values as any).onConflictDoUpdate({
      target: legalEntityTable.id,
      set: values as any,
    })
  }

  static async findOAuthLink(userId: string, providerName: string): Promise<UserOAuthLink | null> {
    const row = await this.db.query.userOauthLinks.findFirst({
      where: and(
        eq(oauthLinksTable.userId, userId) as any,
        eq(oauthLinksTable.providerName, providerName) as any,
      ) as any,
    })
    if (!row) return null

    return new UserOAuthLink(row.id, row.userId, row.providerName, row.providerUserId, row.createdAt)
  }

  static async listOAuthLinks(userId: string): Promise<UserOAuthLink[]> {
    const rows = await this.db.query.userOauthLinks.findMany({
      where: eq(oauthLinksTable.userId, userId) as any,
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
    } as any)
  }

  static async deleteOAuthLink(id: string): Promise<void> {
    await this.db.delete(oauthLinksTable).where(eq(oauthLinksTable.id, id) as any)
  }

  static async findDeviceById(deviceId: string): Promise<UserMobileDevice | null> {
    const row = await this.db.query.userMobileDevices.findFirst({
      where: eq(devicesTable.id, deviceId) as any,
    })
    if (!row) return null
    return this.deviceToDomain(row as any)
  }

  static async findDeviceByIdentifier(userId: string, deviceIdentifier: string): Promise<UserMobileDevice | null> {
    const row = await this.db.query.userMobileDevices.findFirst({
      where: and(
        eq(devicesTable.userId, userId) as any,
        eq(devicesTable.deviceIdentifier, deviceIdentifier) as any,
      ) as any,
    })
    if (!row) return null
    return this.deviceToDomain(row as any)
  }

  static async listDevices(userId: string): Promise<UserMobileDevice[]> {
    const rows = await this.db.query.userMobileDevices.findMany({
      where: eq(devicesTable.userId, userId) as any,
    })
    return rows.map((r) => this.deviceToDomain(r as any))
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
    await this.db.insert(devicesTable).values(values as any).onConflictDoUpdate({
      target: devicesTable.id,
      set: values as any,
    })
  }

  static async deleteDevice(deviceId: string): Promise<void> {
    await this.db.delete(devicesTable).where(eq(devicesTable.id, deviceId) as any)
  }

  private static deviceToDomain(row: any): UserMobileDevice {
    return new UserMobileDevice(
      row.id, row.tenantId, row.userId,
      row.deviceIdentifier, row.platform,
      row.deviceModel, row.osVersion,
      row.pushNotificationToken, row.isTrustedDevice,
      row.lastActiveAt, row.createdAt, row.updatedAt,
    )
  }
}
