import { CreateContactInputDto } from '../../dto/CreateContactInputDto'
import { CreateContactOutputDto } from '../../dto/CreateContactOutputDto'

export interface ICreateContactUseCase {
  execute(input: CreateContactInputDto): Promise<CreateContactOutputDto>
}
