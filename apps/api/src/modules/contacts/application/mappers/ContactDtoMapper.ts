import { Contact } from '../../domain/entities/Contact'
import { ContactOutputDto } from '../dto/ContactOutputDto'

export class ContactDtoMapper {
  static toDto(contact: Contact): ContactOutputDto {
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
      lastTalkedToAt: contact.lastTalkedToAt ? contact.lastTalkedToAt.toISOString() : null,
      taxRegime: contact.taxRegime,
      isTaxLiable: contact.isTaxLiable,
      jobTitle: contact.jobTitle,
      leadSource: contact.leadSource,
      leadStatus: contact.leadStatus.toString(),
      loyaltyPoints: contact.loyaltyPoints,
      avatarUrl: contact.avatarUrl,
      metadata: contact.metadata,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }
  }
}
