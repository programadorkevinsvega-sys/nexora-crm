import { IUpdateContactUseCase } from '../ports/in/IUpdateContactUseCase'
import { IContactRepository } from '../../domain/repositories/IContactRepository'
import { IEventPublisherPort } from '../ports/out/IEventPublisherPort'
import { UpdateContactInputDto } from '../dto/UpdateContactInputDto'
import { ContactNotFoundError } from '../../domain/errors/ContactNotFoundError'
import { LeadStatus } from '../../domain/value-objects/LeadStatus'
import { ContactUpdatedDomainEvent } from '../../domain/events/ContactUpdatedDomainEvent'

export class UpdateContactUseCase implements IUpdateContactUseCase {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(input: UpdateContactInputDto): Promise<void> {
    const contact = await this.contactRepository.findById(input.tenantId, input.id)
    if (!contact) {
      throw new ContactNotFoundError(input.id)
    }

    const updated = contact.update({
      companyId: input.companyId !== undefined ? input.companyId : contact.companyId,
      firstName: input.firstName ?? contact.firstName,
      lastName: input.lastName !== undefined ? input.lastName : contact.lastName,
      identificationType: input.identificationType !== undefined ? input.identificationType : contact.identificationType,
      identificationNumber: input.identificationNumber !== undefined ? input.identificationNumber : contact.identificationNumber,
      verificationDigit: input.verificationDigit !== undefined ? input.verificationDigit : contact.verificationDigit,
      email: input.email !== undefined ? input.email : contact.email,
      phone: input.phone !== undefined ? input.phone : contact.phone,
      birthDate: input.birthDate !== undefined ? (input.birthDate ? new Date(input.birthDate) : null) : contact.birthDate,
      streetAddress: input.streetAddress !== undefined ? input.streetAddress : contact.streetAddress,
      city: input.city !== undefined ? input.city : contact.city,
      stateProvince: input.stateProvince !== undefined ? input.stateProvince : contact.stateProvince,
      postalCode: input.postalCode !== undefined ? input.postalCode : contact.postalCode,
      country: input.country !== undefined ? input.country : contact.country,
      latitude: input.latitude !== undefined ? input.latitude : contact.latitude,
      longitude: input.longitude !== undefined ? input.longitude : contact.longitude,
      nickname: input.nickname !== undefined ? input.nickname : contact.nickname,
      gender: input.gender !== undefined ? input.gender : contact.gender,
      isStarred: input.isStarred !== undefined ? input.isStarred : contact.isStarred,
      isDeceased: input.isDeceased !== undefined ? input.isDeceased : contact.isDeceased,
      stayInTouchFrequencyDays: input.stayInTouchFrequencyDays !== undefined ? input.stayInTouchFrequencyDays : contact.stayInTouchFrequencyDays,
      lastTalkedToAt: input.lastTalkedToAt !== undefined ? (input.lastTalkedToAt ? new Date(input.lastTalkedToAt) : null) : contact.lastTalkedToAt,
      taxRegime: input.taxRegime !== undefined ? input.taxRegime : contact.taxRegime,
      isTaxLiable: input.isTaxLiable !== undefined ? input.isTaxLiable : contact.isTaxLiable,
      jobTitle: input.jobTitle !== undefined ? input.jobTitle : contact.jobTitle,
      leadSource: input.leadSource !== undefined ? input.leadSource : contact.leadSource,
      leadStatus: input.leadStatus !== undefined ? LeadStatus.fromString(input.leadStatus) : contact.leadStatus,
      loyaltyPoints: input.loyaltyPoints !== undefined ? input.loyaltyPoints : contact.loyaltyPoints,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : contact.avatarUrl,
      metadata: input.metadata !== undefined ? input.metadata : contact.metadata,
    })

    await this.contactRepository.save(updated)
    await this.eventPublisher.publish(
      new ContactUpdatedDomainEvent(updated.id, updated.firstName, updated.lastName),
    )
  }
}
