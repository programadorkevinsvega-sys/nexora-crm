export class RegisterCommand {
  constructor(
    readonly name: string,
    readonly email: string,
    readonly password: string,
    readonly company: string,
    readonly ipAddress?: string,
    readonly userAgent?: string,
  ) {}
}

export class LoginCommand {
  constructor(
    readonly tenantId: string,
    readonly email: string,
    readonly password: string,
    readonly ipAddress?: string,
    readonly userAgent?: string,
    readonly deviceId?: string,
    readonly mfaCode?: string,
  ) {}
}

export class RefreshTokenCommand {
  constructor(
    readonly tenantId: string,
    readonly refreshToken: string,
  ) {}
}

export class LogoutCommand {
  constructor(
    readonly tenantId: string,
    readonly sessionId: string,
  ) {}
}

export class ChangePasswordCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly currentPassword: string,
    readonly newPassword: string,
  ) {}
}

export class SetupMfaCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly type: 'TOTP' | 'SMS' | 'EMAIL',
    readonly phone?: string,
    readonly email?: string,
  ) {}
}

export class VerifyMfaCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly code: string,
    readonly methodId: string,
  ) {}
}

export class GetRecoveryCodesCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
  ) {}
}

export class RegenerateRecoveryCodesCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
  ) {}
}

export class UpdatePasswordPolicyCommand {
  constructor(
    readonly tenantId: string,
    readonly minLength?: number,
    readonly requireUppercase?: boolean,
    readonly requireNumbers?: boolean,
    readonly requireSymbols?: boolean,
    readonly expireDays?: number,
    readonly preventReuseLastN?: number,
  ) {}
}

export class CreateIpRestrictionCommand {
  constructor(
    readonly tenantId: string,
    readonly ipAddress: string,
    readonly type: 'ALLOW' | 'DENY',
    readonly userId?: string,
    readonly description?: string,
  ) {}
}

export class DeleteIpRestrictionCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
  ) {}
}

export class RevokeSessionCommand {
  constructor(
    readonly tenantId: string,
    readonly sessionId: string,
  ) {}
}

export class CreateOAuthProviderCommand {
  constructor(
    readonly tenantId: string,
    readonly providerName: string,
    readonly clientId: string,
    readonly clientSecret: string,
  ) {}
}

export class DeleteOAuthProviderCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
  ) {}
}
