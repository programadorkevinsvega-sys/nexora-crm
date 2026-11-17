export interface CreateContactInputDto {
  tenantId: string
  companyId?: string | null
  firstName: string
  lastName?: string | null
  identificationType?: string | null
  identificationNumber?: string | null
  verificationDigit?: string | null
  email?: string | null
  phone?: string | null
  birthDate?: Date | string | null
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
  lastTalkedToAt?: Date | string | null
  taxRegime?: string | null
  isTaxLiable?: boolean
  jobTitle?: string | null
  leadSource?: string | null
  leadStatus?: string
  loyaltyPoints?: number
  avatarUrl?: string | null
  metadata?: Record<string, unknown>
}
