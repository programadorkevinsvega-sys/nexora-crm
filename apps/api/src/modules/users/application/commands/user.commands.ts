import { UserStatus } from '../../domain/entities/user.entity'

export class CreateUserCommand {
  constructor(
    readonly tenantId: string,
    readonly email: string,
    readonly passwordHash: string | undefined,
    readonly profileType: 'NATURAL_PERSON' | 'LEGAL_ENTITY',
    readonly firstName?: string,
    readonly lastName?: string,
    readonly identificationNumber?: string,
    readonly phone?: string,
    readonly countryCode?: string,
    readonly preferredLanguage?: string,
    readonly timezone?: string,
    readonly avatarUrl?: string,
    readonly legalName?: string,
    readonly commercialName?: string,
    readonly taxId?: string,
    readonly legalAddress?: string,
    readonly managerId?: string,
  ) {}
}

export class UpdateUserCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly email?: string,
    readonly passwordHash?: string,
    readonly status?: UserStatus,
    readonly managerId?: string | null,
  ) {}
}

export class DeleteUserCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class UpdateNaturalPersonProfileCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly firstName?: string,
    readonly lastName?: string,
    readonly identificationNumber?: string | null,
    readonly phone?: string | null,
    readonly countryCode?: string | null,
    readonly preferredLanguage?: string,
    readonly timezone?: string,
    readonly avatarUrl?: string | null,
  ) {}
}

export class UpdateLegalEntityProfileCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly legalName?: string,
    readonly commercialName?: string | null,
    readonly taxId?: string,
    readonly legalAddress?: string | null,
    readonly countryCode?: string | null,
    readonly isActive?: boolean,
  ) {}
}

export class LinkOAuthCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly providerName: string,
    readonly providerUserId: string,
  ) {}
}

export class UnlinkOAuthCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly providerName: string,
  ) {}
}

export class RegisterDeviceCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly deviceIdentifier: string,
    readonly platform: 'IOS' | 'ANDROID' | 'WEB' | 'OTHER',
    readonly deviceModel?: string,
    readonly osVersion?: string,
    readonly pushNotificationToken?: string,
    readonly isTrustedDevice?: boolean,
  ) {}
}

export class UpdateDeviceCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly deviceId: string,
    readonly deviceModel?: string | null,
    readonly osVersion?: string | null,
    readonly pushNotificationToken?: string | null,
    readonly isTrustedDevice?: boolean,
  ) {}
}

export class RemoveDeviceCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly deviceId: string,
  ) {}
}
