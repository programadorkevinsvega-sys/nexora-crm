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
  isStarred: boolean | null
  isDeceased: boolean | null
  stayInTouchFrequencyDays: number | null
  lastTalkedToAt: Date | null
  taxRegime: string | null
  isTaxLiable: boolean | null
  jobTitle: string | null
  leadSource: string | null
  leadStatus: string | null
  loyaltyPoints: number | null
  avatarUrl: string | null
  metadata: unknown
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
      birthDate: row.birthDate ? new Date(row.birthDate) : null,
      streetAddress: row.streetAddress,
      city: row.city,
      stateProvince: row.stateProvince,
      postalCode: row.postalCode,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
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
      loyaltyPoints: row.loyaltyPoints ?? 0,
      avatarUrl: row.avatarUrl,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
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
      birthDate: contact.birthDate ? contact.birthDate.toISOString().split('T')[0] : null,
      streetAddress: contact.streetAddress,
      city: contact.city,
      stateProvince: contact.stateProvince,
      postalCode: contact.postalCode,
      country: contact.country,
      latitude: contact.latitude,
      longitude: contact.longitude,
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
      loyaltyPoints: contact.loyaltyPoints,
      avatarUrl: contact.avatarUrl,
      metadata: contact.metadata,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }
  }
}
