import { IDeleteContactUseCase } from '../ports/in/IDeleteContactUseCase'
import { IContactRepository } from '../../domain/repositories/IContactRepository'
import { IEventPublisherPort } from '../ports/out/IEventPublisherPort'
import { DeleteContactInputDto } from '../dto/DeleteContactInputDto'
import { ContactDeletedDomainEvent } from '../../domain/events/ContactDeletedDomainEvent'

export class DeleteContactUseCase implements IDeleteContactUseCase {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(input: DeleteContactInputDto): Promise<void> {
    await this.contactRepository.delete(input.tenantId, input.id)
    await this.eventPublisher.publish(new ContactDeletedDomainEvent(input.id))
  }
}
