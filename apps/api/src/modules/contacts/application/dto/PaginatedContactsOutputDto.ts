import { ContactOutputDto } from './ContactOutputDto'

export interface PaginatedContactsOutputDto {
  data: ContactOutputDto[]
  nextCursor: string | null
}
