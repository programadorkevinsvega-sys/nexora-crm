import { IGetContactUseCase } from '../ports/in/IGetContactUseCase'
import { IContactRepository } from '../../domain/repositories/IContactRepository'
import { GetContactInputDto } from '../dto/GetContactInputDto'
import { ContactOutputDto } from '../dto/ContactOutputDto'
import { ContactDtoMapper } from '../mappers/ContactDtoMapper'
import { ContactNotFoundError } from '../../domain/errors/ContactNotFoundError'

export class GetContactUseCase implements IGetContactUseCase {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(input: GetContactInputDto): Promise<ContactOutputDto> {
    const contact = await this.contactRepository.findById(input.tenantId, input.id)
    if (!contact) {
      throw new ContactNotFoundError(input.id)
    }
    return ContactDtoMapper.toDto(contact)
  }
}
