/* eslint-disable @typescript-eslint/no-explicit-any */
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
  whatsappNumber: string | null
  linkedinUrl: string | null
  birthDate: string | null
  streetAddress: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string | null
  latitude: string | null
  longitude: string | null
  timezone: string | null
  preferredLanguage: string | null
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
  leadScore: number
  loyaltyPoints: number
  avatarUrl: string | null
  assignedUserId: string | null
  unsubscribedAt: string | null
  metadata: Record<string, any>
  customFields: Record<string, any>
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
  whatsappNumber?: string | null
  linkedinUrl?: string | null
  birthDate?: string | null
  streetAddress?: string | null
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  country?: string | null
  latitude?: string | null
  longitude?: string | null
  timezone?: string | null
  preferredLanguage?: string | null
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
  leadScore?: number
  loyaltyPoints?: number
  avatarUrl?: string | null
  assignedUserId?: string | null
  unsubscribedAt?: string | null
  metadata?: Record<string, any>
  customFields?: Record<string, any>
}

export type ContactUpdateInput = Partial<Omit<ContactCreateInput, "tenantId">>

export class Contact extends Entity<ContactProps> {
  get tenantId(): string { return this.props.tenantId }
  get companyId(): string | null { return this.props.companyId }
  get firstName(): string { return this.props.firstName }
  get lastName(): string | null { return this.props.lastName }
  get identificationType(): string | null { return this.props.identificationType }
  get identificationNumber(): string | null { return this.props.identificationNumber }
  get verificationDigit(): string | null { return this.props.verificationDigit }
  get email(): string | null { return this.props.email }
  get phone(): string | null { return this.props.phone }
  get whatsappNumber(): string | null { return this.props.whatsappNumber }
  get linkedinUrl(): string | null { return this.props.linkedinUrl }
  get birthDate(): string | null { return this.props.birthDate }
  get streetAddress(): string | null { return this.props.streetAddress }
  get city(): string | null { return this.props.city }
  get stateProvince(): string | null { return this.props.stateProvince }
  get postalCode(): string | null { return this.props.postalCode }
  get country(): string | null { return this.props.country }
  get latitude(): string | null { return this.props.latitude }
  get longitude(): string | null { return this.props.longitude }
  get timezone(): string | null { return this.props.timezone }
  get preferredLanguage(): string | null { return this.props.preferredLanguage }
  get nickname(): string | null { return this.props.nickname }
  get gender(): string | null { return this.props.gender }
  get isStarred(): boolean { return this.props.isStarred }
  get isDeceased(): boolean { return this.props.isDeceased }
  get stayInTouchFrequencyDays(): number | null { return this.props.stayInTouchFrequencyDays }
  get lastTalkedToAt(): string | null { return this.props.lastTalkedToAt }
  get taxRegime(): string | null { return this.props.taxRegime }
  get isTaxLiable(): boolean { return this.props.isTaxLiable }
  get jobTitle(): string | null { return this.props.jobTitle }
  get leadSource(): string | null { return this.props.leadSource }
  get leadStatus(): string { return this.props.leadStatus }
  get leadScore(): number { return this.props.leadScore }
  get loyaltyPoints(): number { return this.props.loyaltyPoints }
  get avatarUrl(): string | null { return this.props.avatarUrl }
  get assignedUserId(): string | null { return this.props.assignedUserId }
  get unsubscribedAt(): string | null { return this.props.unsubscribedAt }
  get metadata(): Record<string, any> { return this.props.metadata }
  get customFields(): Record<string, any> { return this.props.customFields }

  static create(props: ContactCreateInput, id: string, createdAt: Date | string, updatedAt: Date | string): Contact {
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
      timezone: props.timezone ?? "America/Bogota",
      preferredLanguage: props.preferredLanguage ?? "ES",
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
      leadScore: props.leadScore ?? 0,
      loyaltyPoints: props.loyaltyPoints ?? 0,
      avatarUrl: props.avatarUrl ?? null,
      assignedUserId: props.assignedUserId ?? null,
      unsubscribedAt: props.unsubscribedAt ?? null,
      metadata: props.metadata ?? {},
      customFields: props.customFields ?? {},
    })
  }

  update(input: ContactUpdateInput): void {
    const keys = Object.keys(input) as Array<keyof ContactUpdateInput>
    for (const key of keys) {
      if (input[key] !== undefined) {
        ;(this.props as any)[key] = input[key]
      }
    }
    this.touch()
  }
}
