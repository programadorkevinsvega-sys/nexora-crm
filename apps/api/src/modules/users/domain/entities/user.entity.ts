import { NaturalPersonProfile } from './natural-person-profile.entity'
import { LegalEntityProfile } from './legal-entity-profile.entity'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED'
export type ProfileType = 'NATURAL_PERSON' | 'LEGAL_ENTITY'

export class User {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly email: string,
    readonly passwordHash: string | null,
    readonly profileId: string,
    readonly profileType: ProfileType,
    readonly status: UserStatus,
    readonly isEmailVerified: boolean,
    readonly failedLoginAttempts: number,
    readonly lockedUntil: Date | null,
    readonly lastLoginAt: Date | null,
    readonly managerId: string | null,
    readonly naturalPersonProfile: NaturalPersonProfile | null,
    readonly legalEntityProfile: LegalEntityProfile | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    email: string
    passwordHash?: string
    profileType: ProfileType
    managerId?: string
  }): User {
    const profileId = crypto.randomUUID()
    return new User(
      crypto.randomUUID(),
      props.tenantId,
      props.email.toLowerCase().trim(),
      props.passwordHash ?? null,
      profileId,
      props.profileType,
      'ACTIVE',
      false,
      0,
      null,
      null,
      props.managerId ?? null,
      null,
      null,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Pick<User, 'email' | 'passwordHash' | 'status' | 'managerId'>>): User {
    return new User(
      this.id,
      this.tenantId,
      props.email !== undefined ? props.email.toLowerCase().trim() : this.email,
      props.passwordHash !== undefined ? props.passwordHash : this.passwordHash,
      this.profileId,
      this.profileType,
      props.status ?? this.status,
      this.isEmailVerified,
      this.failedLoginAttempts,
      this.lockedUntil,
      this.lastLoginAt,
      props.managerId !== undefined ? props.managerId : this.managerId,
      this.naturalPersonProfile,
      this.legalEntityProfile,
      this.createdAt,
      new Date(),
    )
  }

  markEmailVerified(): User {
    return new User(
      this.id, this.tenantId, this.email, this.passwordHash,
      this.profileId, this.profileType, this.status, true,
      this.failedLoginAttempts, this.lockedUntil, this.lastLoginAt,
      this.managerId, this.naturalPersonProfile, this.legalEntityProfile,
      this.createdAt, new Date(),
    )
  }

  incrementFailedAttempts(): User {
    return new User(
      this.id, this.tenantId, this.email, this.passwordHash,
      this.profileId, this.profileType, this.status, this.isEmailVerified,
      this.failedLoginAttempts + 1, this.lockedUntil, this.lastLoginAt,
      this.managerId, this.naturalPersonProfile, this.legalEntityProfile,
      this.createdAt, new Date(),
    )
  }

  lockUntil(date: Date): User {
    return new User(
      this.id, this.tenantId, this.email, this.passwordHash,
      this.profileId, this.profileType, this.status, this.isEmailVerified,
      this.failedLoginAttempts, date, this.lastLoginAt,
      this.managerId, this.naturalPersonProfile, this.legalEntityProfile,
      this.createdAt, new Date(),
    )
  }

  recordLogin(): User {
    return new User(
      this.id, this.tenantId, this.email, this.passwordHash,
      this.profileId, this.profileType, this.status, this.isEmailVerified,
      0, null, new Date(),
      this.managerId, this.naturalPersonProfile, this.legalEntityProfile,
      this.createdAt, new Date(),
    )
  }

  attachProfile(profile: NaturalPersonProfile | LegalEntityProfile): User {
    if (profile instanceof NaturalPersonProfile) {
      return new User(
        this.id, this.tenantId, this.email, this.passwordHash,
        this.profileId, 'NATURAL_PERSON', this.status, this.isEmailVerified,
        this.failedLoginAttempts, this.lockedUntil, this.lastLoginAt,
        this.managerId, profile, null,
        this.createdAt, new Date(),
      )
    }
    return new User(
      this.id, this.tenantId, this.email, this.passwordHash,
        this.profileId, 'LEGAL_ENTITY', this.status, this.isEmailVerified,
        this.failedLoginAttempts, this.lockedUntil, this.lastLoginAt,
        this.managerId, null, profile,
        this.createdAt, new Date(),
    )
  }
}
