import { GetContactInputDto } from '../../dto/GetContactInputDto'
import { ContactOutputDto } from '../../dto/ContactOutputDto'

export interface IGetContactUseCase {
  execute(input: GetContactInputDto): Promise<ContactOutputDto>
}
