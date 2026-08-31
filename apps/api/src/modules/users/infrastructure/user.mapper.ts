import { User } from '../domain/entities/user.entity'
import { NaturalPersonProfile } from '../domain/entities/natural-person-profile.entity'
import { LegalEntityProfile } from '../domain/entities/legal-entity-profile.entity'
import { UserOAuthLink } from '../domain/entities/user-oauth-link.entity'
import { UserMobileDevice } from '../domain/entities/user-mobile-device.entity'

type UserRow = {
  id: string
  tenantId: string
  email: string
  passwordHash: string
  profileId: string
  profileType: string
  status: string | null
  isEmailVerified: boolean | null
  failedLoginAttempts: number | null
  lockedUntil: Date | null
  lastLoginAt: Date | null
  managerId: string | null
  createdAt: Date
  updatedAt: Date
}

/* eslint-disable @typescript-eslint/no-unused-vars */
type NaturalPersonRow = {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  identificationNumber: string | null
  phone: string | null
  countryCode: string | null
  preferredLanguage: string
  timezone: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

type LegalEntityRow = {
  id: string
  tenantId: string
  legalName: string
  commercialName: string | null
  taxId: string
  legalAddress: string | null
  countryCode: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type OAuthLinkRow = {
  id: string
  userId: string
  providerName: string
  providerUserId: string
  createdAt: Date
}

type DeviceRow = {
  id: string
  tenantId: string
  userId: string
  deviceIdentifier: string
  platform: string
  deviceModel: string | null
  osVersion: string | null
  pushNotificationToken: string | null
  isTrustedDevice: boolean
  lastActiveAt: Date
  createdAt: Date
  updatedAt: Date
}

export class UserMapper {
  static toDomain(row: UserRow): User {
    return new User(
      row.id,
      row.tenantId,
      row.email,
      row.passwordHash,
      row.profileId,
      row.profileType as 'NATURAL_PERSON' | 'LEGAL_ENTITY',
      (row.status ?? 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED',
      row.isEmailVerified ?? false,
      row.failedLoginAttempts ?? 0,
      row.lockedUntil,
      row.lastLoginAt,
      row.managerId,
      null,
      null,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(user: User): UserRow {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      passwordHash: user.passwordHash ?? '',
      profileId: user.profileId,
      profileType: user.profileType,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
      managerId: user.managerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static toResponse(user: User) {
    const base: Record<string, unknown> = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      profileType: user.profileType,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      managerId: user.managerId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }

    if (user.naturalPersonProfile) {
      base.profile = UserMapper.naturalPersonToResponse(user.naturalPersonProfile)
    } else if (user.legalEntityProfile) {
      base.profile = UserMapper.legalEntityToResponse(user.legalEntityProfile)
    }

    return base
  }

  static naturalPersonToResponse(profile: NaturalPersonProfile) {
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      identificationNumber: profile.identificationNumber,
      phone: profile.phone,
      countryCode: profile.countryCode,
      preferredLanguage: profile.preferredLanguage,
      timezone: profile.timezone,
      avatarUrl: profile.avatarUrl,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }
  }

  static legalEntityToResponse(profile: LegalEntityProfile) {
    return {
      id: profile.id,
      legalName: profile.legalName,
      commercialName: profile.commercialName,
      taxId: profile.taxId,
      legalAddress: profile.legalAddress,
      countryCode: profile.countryCode,
      isActive: profile.isActive,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }
  }

  static oauthLinkToResponse(link: UserOAuthLink) {
    return {
      id: link.id,
      userId: link.userId,
      providerName: link.providerName,
      providerUserId: link.providerUserId,
      createdAt: link.createdAt.toISOString(),
    }
  }

  static deviceToResponse(device: UserMobileDevice) {
    return {
      id: device.id,
      userId: device.userId,
      deviceIdentifier: device.deviceIdentifier,
      platform: device.platform,
      deviceModel: device.deviceModel,
      osVersion: device.osVersion,
      pushNotificationToken: device.pushNotificationToken,
      isTrustedDevice: device.isTrustedDevice,
      lastActiveAt: device.lastActiveAt.toISOString(),
      createdAt: device.createdAt.toISOString(),
      updatedAt: device.updatedAt.toISOString(),
    }
  }
}
