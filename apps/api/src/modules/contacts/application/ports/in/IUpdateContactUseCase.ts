import { UpdateContactInputDto } from '../../dto/UpdateContactInputDto'

export interface IUpdateContactUseCase {
  execute(input: UpdateContactInputDto): Promise<void>
}
