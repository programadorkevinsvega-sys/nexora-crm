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
  whatsappNumber?: string | null
  linkedinUrl?: string | null
  birthDate: Date | null
  streetAddress: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string | null
  latitude: string | null
  longitude: string | null
  timezone?: string | null
  preferredLanguage?: string | null
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
  leadScore?: number | null
  loyaltyPoints: number
  avatarUrl: string | null
  assignedUserId?: string | null
  unsubscribedAt?: Date | null
  metadata: Record<string, unknown>
  customFields?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type CreateContactProps = Partial<Omit<ContactProps, 'id' | 'createdAt' | 'updatedAt'>> & {
  tenantId: string
  firstName: string
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
  readonly whatsappNumber: string | null
  readonly linkedinUrl: string | null
  readonly birthDate: Date | null
  readonly streetAddress: string | null
  readonly city: string | null
  readonly stateProvince: string | null
  readonly postalCode: string | null
  readonly country: string | null
  readonly latitude: string | null
  readonly longitude: string | null
  readonly timezone: string | null
  readonly preferredLanguage: string | null
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
  readonly leadScore: number
  readonly loyaltyPoints: number
  readonly avatarUrl: string | null
  readonly assignedUserId: string | null
  readonly unsubscribedAt: Date | null
  readonly metadata: Record<string, unknown>
  readonly customFields: Record<string, unknown>
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(p: ContactProps) {
    this.id = p.id
    this.tenantId = p.tenantId
    this.companyId = p.companyId ?? null
    this.firstName = p.firstName
    this.lastName = p.lastName ?? null
    this.identificationType = p.identificationType ?? null
    this.identificationNumber = p.identificationNumber ?? null
    this.verificationDigit = p.verificationDigit ?? null
    this.email = p.email ?? null
    this.phone = p.phone ?? null
    this.whatsappNumber = p.whatsappNumber ?? null
    this.linkedinUrl = p.linkedinUrl ?? null
    this.birthDate = p.birthDate ?? null
    this.streetAddress = p.streetAddress ?? null
    this.city = p.city ?? null
    this.stateProvince = p.stateProvince ?? null
    this.postalCode = p.postalCode ?? null
    this.country = p.country ?? null
    this.latitude = p.latitude ?? null
    this.longitude = p.longitude ?? null
    this.timezone = p.timezone ?? 'America/Bogota'
    this.preferredLanguage = p.preferredLanguage ?? 'ES'
    this.nickname = p.nickname ?? null
    this.gender = p.gender ?? null
    this.isStarred = p.isStarred ?? false
    this.isDeceased = p.isDeceased ?? false
    this.stayInTouchFrequencyDays = p.stayInTouchFrequencyDays ?? null
    this.lastTalkedToAt = p.lastTalkedToAt ?? null
    this.taxRegime = p.taxRegime ?? null
    this.isTaxLiable = p.isTaxLiable ?? false
    this.jobTitle = p.jobTitle ?? null
    this.leadSource = p.leadSource ?? null
    this.leadStatus = p.leadStatus ?? LeadStatus.fromString('NEW')
    this.leadScore = p.leadScore ?? 0
    this.loyaltyPoints = p.loyaltyPoints ?? 0
    this.avatarUrl = p.avatarUrl ?? null
    this.assignedUserId = p.assignedUserId ?? null
    this.unsubscribedAt = p.unsubscribedAt ?? null
    this.metadata = p.metadata ?? {}
    this.customFields = p.customFields ?? {}
    this.createdAt = p.createdAt
    this.updatedAt = p.updatedAt
  }

  static create(props: CreateContactProps): Contact {
    const now = new Date()
    return new Contact({
      id: crypto.randomUUID(),
      tenantId: props.tenantId,
      companyId: props.companyId ?? null,
      firstName: props.firstName,
      lastName: props.lastName ?? null,
      identificationType: props.identificationType ?? null,
      identificationNumber: props.identificationNumber ?? null,
      verificationDigit: props.verificationDigit ?? null,
      email: props.email ?? null,
      phone: props.phone ?? null,
      whatsappNumber: props.whatsappNumber ?? null,
      linkedinUrl: props.linkedinUrl ?? null,
      birthDate: props.birthDate ?? null,
      streetAddress: props.streetAddress ?? null,
      city: props.city ?? null,
      stateProvince: props.stateProvince ?? null,
      postalCode: props.postalCode ?? null,
      country: props.country ?? null,
      latitude: props.latitude ?? null,
      longitude: props.longitude ?? null,
      timezone: props.timezone ?? 'America/Bogota',
      preferredLanguage: props.preferredLanguage ?? 'ES',
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
      leadScore: props.leadScore ?? 0,
      loyaltyPoints: props.loyaltyPoints ?? 0,
      avatarUrl: props.avatarUrl ?? null,
      assignedUserId: props.assignedUserId ?? null,
      unsubscribedAt: props.unsubscribedAt ?? null,
      metadata: props.metadata ?? {},
      customFields: props.customFields ?? {},
      createdAt: now,
      updatedAt: now,
    })
  }

  update(props: Partial<Omit<ContactProps, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Contact {
    return new Contact({ ...this, ...props, updatedAt: new Date() })
  }
}
