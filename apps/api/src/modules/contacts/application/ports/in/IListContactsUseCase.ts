import { ListContactsInputDto } from '../../dto/ListContactsInputDto'
import { PaginatedContactsOutputDto } from '../../dto/PaginatedContactsOutputDto'

export interface IListContactsUseCase {
  execute(input: ListContactsInputDto): Promise<PaginatedContactsOutputDto>
}
