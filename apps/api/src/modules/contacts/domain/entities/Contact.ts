import { LeadStatus } from '../value-objects/LeadStatus'

export interface ContactProps {
  id: string
  tenantId: string
  companyId: string | null
  firstName: string
  lastName: string | null
  identificationType: string | null
  identificationNumber: string | null
  verificationDigit: string | null
  email: string | null
  phone: string | null
  birthDate: Date | null
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
  lastTalkedToAt: Date | null
  taxRegime: string | null
  isTaxLiable: boolean
  jobTitle: string | null
  leadSource: string | null
  leadStatus: LeadStatus
  loyaltyPoints: number
  avatarUrl: string | null
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface CreateContactProps {
  tenantId: string
  firstName: string
  companyId?: string | null
  lastName?: string | null
  identificationType?: string | null
  identificationNumber?: string | null
  verificationDigit?: string | null
  email?: string | null
  phone?: string | null
  birthDate?: Date | null
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
  lastTalkedToAt?: Date | null
  taxRegime?: string | null
  isTaxLiable?: boolean
  jobTitle?: string | null
  leadSource?: string | null
  leadStatus?: LeadStatus
  loyaltyPoints?: number
  avatarUrl?: string | null
  metadata?: Record<string, unknown>
}

export class Contact {
  readonly id: string
  readonly tenantId: string
  readonly companyId: string | null
  readonly firstName: string
  readonly lastName: string | null
  readonly identificationType: string | null
  readonly identificationNumber: string | null
  readonly verificationDigit: string | null
  readonly email: string | null
  readonly phone: string | null
  readonly birthDate: Date | null
  readonly streetAddress: string | null
  readonly city: string | null
  readonly stateProvince: string | null
  readonly postalCode: string | null
  readonly country: string | null
  readonly latitude: string | null
  readonly longitude: string | null
  readonly nickname: string | null
  readonly gender: string | null
  readonly isStarred: boolean
  readonly isDeceased: boolean
  readonly stayInTouchFrequencyDays: number | null
  readonly lastTalkedToAt: Date | null
  readonly taxRegime: string | null
  readonly isTaxLiable: boolean
  readonly jobTitle: string | null
  readonly leadSource: string | null
  readonly leadStatus: LeadStatus
  readonly loyaltyPoints: number
  readonly avatarUrl: string | null
  readonly metadata: Record<string, unknown>
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: ContactProps) {
    this.id = props.id
    this.tenantId = props.tenantId
    this.companyId = props.companyId
    this.firstName = props.firstName
    this.lastName = props.lastName
    this.identificationType = props.identificationType
    this.identificationNumber = props.identificationNumber
    this.verificationDigit = props.verificationDigit
    this.email = props.email
    this.phone = props.phone
    this.birthDate = props.birthDate
    this.streetAddress = props.streetAddress
    this.city = props.city
    this.stateProvince = props.stateProvince
    this.postalCode = props.postalCode
    this.country = props.country
    this.latitude = props.latitude
    this.longitude = props.longitude
    this.nickname = props.nickname
    this.gender = props.gender
    this.isStarred = props.isStarred
    this.isDeceased = props.isDeceased
    this.stayInTouchFrequencyDays = props.stayInTouchFrequencyDays
    this.lastTalkedToAt = props.lastTalkedToAt
    this.taxRegime = props.taxRegime
    this.isTaxLiable = props.isTaxLiable
    this.jobTitle = props.jobTitle
    this.leadSource = props.leadSource
    this.leadStatus = props.leadStatus
    this.loyaltyPoints = props.loyaltyPoints
    this.avatarUrl = props.avatarUrl
    this.metadata = props.metadata
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: CreateContactProps): Contact {
    const now = new Date()
    return new Contact({
      id: crypto.randomUUID(),
      tenantId: props.tenantId,
      firstName: props.firstName,
      companyId: props.companyId ?? null,
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
      leadStatus: props.leadStatus ?? LeadStatus.fromString('NEW'),
      loyaltyPoints: props.loyaltyPoints ?? 0,
      avatarUrl: props.avatarUrl ?? null,
      metadata: props.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    })
  }

  update(props: Partial<Omit<ContactProps, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Contact {
    return new Contact({
      ...this,
      ...props,
      updatedAt: new Date(),
    })
  }
}
