import { Entity } from "../common/entities/base.entity"

export interface ContactProps {
  tenantId: string
  companyId: string | null
  firstName: string
  lastName: string | null
  identificationType: string | null
  identificationNumber: string | null
  verificationDigit: string | null
  email: string | null
  phone: string | null
  birthDate: string | null
  streetAddress: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string | null
  latitude: string | null
  longitude: string | null
  nickname: string | null
  gender: string | null
  isStarred: boolean
  isDeceased: boolean
  stayInTouchFrequencyDays: number | null
  lastTalkedToAt: string | null
  taxRegime: string | null
  isTaxLiable: boolean
  jobTitle: string | null
  leadSource: string | null
  leadStatus: string
  loyaltyPoints: number
  avatarUrl: string | null
  metadata: Record<string, any>
}

export class Contact extends Entity<ContactProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get companyId(): string | null {
    return this.props.companyId
  }

  get firstName(): string {
    return this.props.firstName
  }

  get lastName(): string | null {
    return this.props.lastName
  }

  get identificationType(): string | null {
    return this.props.identificationType
  }

  get identificationNumber(): string | null {
    return this.props.identificationNumber
  }

  get verificationDigit(): string | null {
    return this.props.verificationDigit
  }

  get email(): string | null {
    return this.props.email
  }

  get phone(): string | null {
    return this.props.phone
  }

  get birthDate(): string | null {
    return this.props.birthDate
  }

  get streetAddress(): string | null {
    return this.props.streetAddress
  }

  get city(): string | null {
    return this.props.city
  }

  get stateProvince(): string | null {
    return this.props.stateProvince
  }

  get postalCode(): string | null {
    return this.props.postalCode
  }

  get country(): string | null {
    return this.props.country
  }

  get latitude(): string | null {
    return this.props.latitude
  }

  get longitude(): string | null {
    return this.props.longitude
  }

  get nickname(): string | null {
    return this.props.nickname
  }

  get gender(): string | null {
    return this.props.gender
  }

  get isStarred(): boolean {
    return this.props.isStarred
  }

  get isDeceased(): boolean {
    return this.props.isDeceased
  }

  get stayInTouchFrequencyDays(): number | null {
    return this.props.stayInTouchFrequencyDays
  }

  get lastTalkedToAt(): string | null {
    return this.props.lastTalkedToAt
  }

  get taxRegime(): string | null {
    return this.props.taxRegime
  }

  get isTaxLiable(): boolean {
    return this.props.isTaxLiable
  }

  get jobTitle(): string | null {
    return this.props.jobTitle
  }

  get leadSource(): string | null {
    return this.props.leadSource
  }

  get leadStatus(): string {
    return this.props.leadStatus
  }

  get loyaltyPoints(): number {
    return this.props.loyaltyPoints
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl
  }

  get metadata(): Record<string, any> {
    return this.props.metadata
  }

  static create(
    props: ContactCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Contact {
    return new Contact(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      companyId: props.companyId ?? null,
      firstName: props.firstName,
      lastName: props.lastName ?? null,
      identificationType: props.identificationType ?? null,
      identificationNumber: props.identificationNumber ?? null,
      verificationDigit: props.verificationDigit ?? null,
      email: props.email ?? null,
      phone: props.phone ?? null,
      birthDate: props.birthDate ?? null,
      streetAddress: props.streetAddress ?? null,
      city: props.city ?? null,
      stateProvince: props.stateProvince ?? null,
      postalCode: props.postalCode ?? null,
      country: props.country ?? null,
      latitude: props.latitude ?? null,
      longitude: props.longitude ?? null,
      nickname: props.nickname ?? null,
      gender: props.gender ?? null,
      isStarred: props.isStarred ?? false,
      isDeceased: props.isDeceased ?? false,
      stayInTouchFrequencyDays: props.stayInTouchFrequencyDays ?? null,
      lastTalkedToAt: props.lastTalkedToAt ?? null,
      taxRegime: props.taxRegime ?? null,
      isTaxLiable: props.isTaxLiable ?? false,
      jobTitle: props.jobTitle ?? null,
      leadSource: props.leadSource ?? null,
      leadStatus: props.leadStatus ?? "NEW",
      loyaltyPoints: props.loyaltyPoints ?? 0,
      avatarUrl: props.avatarUrl ?? null,
      metadata: props.metadata ?? {},
    })
  }

  update(input: ContactUpdateInput): void {
    if (input.companyId !== undefined) {
      this.props.companyId = input.companyId
    }
    if (input.firstName !== undefined) {
      this.props.firstName = input.firstName
    }
    if (input.lastName !== undefined) {
      this.props.lastName = input.lastName
    }
    if (input.identificationType !== undefined) {
      this.props.identificationType = input.identificationType
    }
    if (input.identificationNumber !== undefined) {
      this.props.identificationNumber = input.identificationNumber
    }
    if (input.verificationDigit !== undefined) {
      this.props.verificationDigit = input.verificationDigit
    }
    if (input.email !== undefined) {
      this.props.email = input.email
    }
    if (input.phone !== undefined) {
      this.props.phone = input.phone
    }
    if (input.birthDate !== undefined) {
      this.props.birthDate = input.birthDate
    }
    if (input.streetAddress !== undefined) {
      this.props.streetAddress = input.streetAddress
    }
    if (input.city !== undefined) {
      this.props.city = input.city
    }
    if (input.stateProvince !== undefined) {
      this.props.stateProvince = input.stateProvince
    }
    if (input.postalCode !== undefined) {
      this.props.postalCode = input.postalCode
    }
    if (input.country !== undefined) {
      this.props.country = input.country
    }
    if (input.latitude !== undefined) {
      this.props.latitude = input.latitude
    }
    if (input.longitude !== undefined) {
      this.props.longitude = input.longitude
    }
    if (input.nickname !== undefined) {
      this.props.nickname = input.nickname
    }
    if (input.gender !== undefined) {
      this.props.gender = input.gender
    }
    if (input.isStarred !== undefined) {
      this.props.isStarred = input.isStarred
    }
    if (input.isDeceased !== undefined) {
      this.props.isDeceased = input.isDeceased
    }
    if (input.stayInTouchFrequencyDays !== undefined) {
      this.props.stayInTouchFrequencyDays = input.stayInTouchFrequencyDays
    }
    if (input.lastTalkedToAt !== undefined) {
      this.props.lastTalkedToAt = input.lastTalkedToAt
    }
    if (input.taxRegime !== undefined) {
      this.props.taxRegime = input.taxRegime
    }
    if (input.isTaxLiable !== undefined) {
      this.props.isTaxLiable = input.isTaxLiable
    }
    if (input.jobTitle !== undefined) {
      this.props.jobTitle = input.jobTitle
    }
    if (input.leadSource !== undefined) {
      this.props.leadSource = input.leadSource
    }
    if (input.leadStatus !== undefined) {
      this.props.leadStatus = input.leadStatus
    }
    if (input.loyaltyPoints !== undefined) {
      this.props.loyaltyPoints = input.loyaltyPoints
    }
    if (input.avatarUrl !== undefined) {
      this.props.avatarUrl = input.avatarUrl
    }
    if (input.metadata !== undefined) {
      this.props.metadata = input.metadata
    }
    this.touch()
  }
}

export interface ContactCreateInput {
  tenantId: string
  firstName: string
  lastName?: string | null
  companyId?: string | null
  identificationType?: string | null
  identificationNumber?: string | null
  verificationDigit?: string | null
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  streetAddress?: string | null
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  country?: string | null
  latitude?: string | null
  longitude?: string | null
  nickname?: string | null
  gender?: string | null
  isStarred?: boolean
  isDeceased?: boolean
  stayInTouchFrequencyDays?: number | null
  lastTalkedToAt?: string | null
  taxRegime?: string | null
  isTaxLiable?: boolean
  jobTitle?: string | null
  leadSource?: string | null
  leadStatus?: string
  loyaltyPoints?: number
  avatarUrl?: string | null
  metadata?: Record<string, any>
}

export interface ContactUpdateInput {
  companyId?: string | null
  firstName?: string
  lastName?: string | null
  identificationType?: string | null
  identificationNumber?: string | null
  verificationDigit?: string | null
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  streetAddress?: string | null
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  country?: string | null
  latitude?: string | null
  longitude?: string | null
  nickname?: string | null
  gender?: string | null
  isStarred?: boolean
  isDeceased?: boolean
  stayInTouchFrequencyDays?: number | null
  lastTalkedToAt?: string | null
  taxRegime?: string | null
  isTaxLiable?: boolean
  jobTitle?: string | null
  leadSource?: string | null
  leadStatus?: string
  loyaltyPoints?: number
  avatarUrl?: string | null
  metadata?: Record<string, any>
}
