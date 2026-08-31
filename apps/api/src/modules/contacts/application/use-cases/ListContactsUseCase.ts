import { IListContactsUseCase } from '../ports/in/IListContactsUseCase'
import { IContactRepository } from '../../domain/repositories/IContactRepository'
import { ListContactsInputDto } from '../dto/ListContactsInputDto'
import { PaginatedContactsOutputDto } from '../dto/PaginatedContactsOutputDto'
import { ContactDtoMapper } from '../mappers/ContactDtoMapper'

export class ListContactsUseCase implements IListContactsUseCase {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(input: ListContactsInputDto): Promise<PaginatedContactsOutputDto> {
    const result = await this.contactRepository.list(input.tenantId, {
      search: input.search,
      leadStatus: input.leadStatus,
      companyId: input.companyId,
      isStarred: input.isStarred,
      assignedUserId: input.assignedUserId,
      visibleUserIds: input.visibleUserIds,
      cursor: input.cursor,
      limit: Math.min(input.limit || 20, 100),
    })

    return {
      data: result.data.map(ContactDtoMapper.toDto),
      nextCursor: result.nextCursor,
    }
  }
}
