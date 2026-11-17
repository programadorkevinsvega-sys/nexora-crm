import { Contact } from '../../../../domain/entities/Contact'
import { LeadStatus } from '../../../../domain/value-objects/LeadStatus'

export type ContactPersistenceRow = {
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
  isStarred: boolean | null
  isDeceased: boolean | null
  stayInTouchFrequencyDays: number | null
  lastTalkedToAt: Date | null
  taxRegime: string | null
  isTaxLiable: boolean | null
  jobTitle: string | null
  leadSource: string | null
  leadStatus: string | null
  leadScore: number | null
  loyaltyPoints: number | null
  avatarUrl: string | null
  assignedUserId: string | null
  unsubscribedAt: Date | null
  metadata: unknown
  customFields: unknown
  createdAt: Date
  updatedAt: Date
}

export class ContactPersistenceMapper {
  static toDomain(row: ContactPersistenceRow): Contact {
    return new Contact({
      id: row.id,
      tenantId: row.tenantId,
      companyId: row.companyId,
      firstName: row.firstName,
      lastName: row.lastName,
      identificationType: row.identificationType,
      identificationNumber: row.identificationNumber,
      verificationDigit: row.verificationDigit,
      email: row.email,
      phone: row.phone,
      whatsappNumber: row.whatsappNumber,
      linkedinUrl: row.linkedinUrl,
      birthDate: row.birthDate ? new Date(row.birthDate) : null,
      streetAddress: row.streetAddress,
      city: row.city,
      stateProvince: row.stateProvince,
      postalCode: row.postalCode,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
      timezone: row.timezone ?? 'America/Bogota',
      preferredLanguage: row.preferredLanguage ?? 'ES',
      nickname: row.nickname,
      gender: row.gender,
      isStarred: row.isStarred ?? false,
      isDeceased: row.isDeceased ?? false,
      stayInTouchFrequencyDays: row.stayInTouchFrequencyDays,
      lastTalkedToAt: row.lastTalkedToAt ? new Date(row.lastTalkedToAt) : null,
      taxRegime: row.taxRegime,
      isTaxLiable: row.isTaxLiable ?? false,
      jobTitle: row.jobTitle,
      leadSource: row.leadSource,
      leadStatus: row.leadStatus ? LeadStatus.fromString(row.leadStatus) : LeadStatus.fromString('NEW'),
      leadScore: row.leadScore ?? 0,
      loyaltyPoints: row.loyaltyPoints ?? 0,
      avatarUrl: row.avatarUrl,
      assignedUserId: row.assignedUserId,
      unsubscribedAt: row.unsubscribedAt ? new Date(row.unsubscribedAt) : null,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      customFields: (row.customFields ?? {}) as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  static toPersistence(contact: Contact): ContactPersistenceRow {
    return {
      id: contact.id,
      tenantId: contact.tenantId,
      companyId: contact.companyId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      identificationType: contact.identificationType,
      identificationNumber: contact.identificationNumber,
      verificationDigit: contact.verificationDigit,
      email: contact.email,
      phone: contact.phone,
      whatsappNumber: contact.whatsappNumber,
      linkedinUrl: contact.linkedinUrl,
      birthDate: contact.birthDate ? contact.birthDate.toISOString().split('T')[0] : null,
      streetAddress: contact.streetAddress,
      city: contact.city,
      stateProvince: contact.stateProvince,
      postalCode: contact.postalCode,
      country: contact.country,
      latitude: contact.latitude,
      longitude: contact.longitude,
      timezone: contact.timezone,
      preferredLanguage: contact.preferredLanguage,
      nickname: contact.nickname,
      gender: contact.gender,
      isStarred: contact.isStarred,
      isDeceased: contact.isDeceased,
      stayInTouchFrequencyDays: contact.stayInTouchFrequencyDays,
      lastTalkedToAt: contact.lastTalkedToAt,
      taxRegime: contact.taxRegime,
      isTaxLiable: contact.isTaxLiable,
      jobTitle: contact.jobTitle,
      leadSource: contact.leadSource,
      leadStatus: contact.leadStatus.toString(),
      leadScore: contact.leadScore,
      loyaltyPoints: contact.loyaltyPoints,
      avatarUrl: contact.avatarUrl,
      assignedUserId: contact.assignedUserId,
      unsubscribedAt: contact.unsubscribedAt,
      metadata: contact.metadata,
      customFields: contact.customFields,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }
  }
}
