import { ICreateContactUseCase } from '../ports/in/ICreateContactUseCase'
import { IContactRepository } from '../../domain/repositories/IContactRepository'
import { IEventPublisherPort } from '../ports/out/IEventPublisherPort'
import { CreateContactInputDto } from '../dto/CreateContactInputDto'
import { CreateContactOutputDto } from '../dto/CreateContactOutputDto'
import { Contact } from '../../domain/entities/Contact'
import { LeadStatus } from '../../domain/value-objects/LeadStatus'
import { ContactCreatedDomainEvent } from '../../domain/events/ContactCreatedDomainEvent'

export class CreateContactUseCase implements ICreateContactUseCase {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(input: CreateContactInputDto): Promise<CreateContactOutputDto> {
    const contact = Contact.create({
      tenantId: input.tenantId,
      companyId: input.companyId ?? null,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      identificationType: input.identificationType ?? null,
      identificationNumber: input.identificationNumber ?? null,
      verificationDigit: input.verificationDigit ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      streetAddress: input.streetAddress ?? null,
      city: input.city ?? null,
      stateProvince: input.stateProvince ?? null,
      postalCode: input.postalCode ?? null,
      country: input.country ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      nickname: input.nickname ?? null,
      gender: input.gender ?? null,
      isStarred: input.isStarred ?? false,
      isDeceased: input.isDeceased ?? false,
      stayInTouchFrequencyDays: input.stayInTouchFrequencyDays ?? null,
      lastTalkedToAt: input.lastTalkedToAt ? new Date(input.lastTalkedToAt) : null,
      taxRegime: input.taxRegime ?? null,
      isTaxLiable: input.isTaxLiable ?? false,
      jobTitle: input.jobTitle ?? null,
      leadSource: input.leadSource ?? null,
      leadStatus: input.leadStatus ? LeadStatus.fromString(input.leadStatus) : LeadStatus.fromString('NEW'),
      loyaltyPoints: input.loyaltyPoints ?? 0,
      avatarUrl: input.avatarUrl ?? null,
      metadata: input.metadata ?? {},
    })

    await this.contactRepository.save(contact)
    await this.eventPublisher.publish(
      new ContactCreatedDomainEvent(contact.id, contact.firstName, contact.lastName),
    )

    return { id: contact.id }
  }
}
