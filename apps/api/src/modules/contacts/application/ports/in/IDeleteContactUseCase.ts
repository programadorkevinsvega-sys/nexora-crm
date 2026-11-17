import { DeleteContactInputDto } from '../../dto/DeleteContactInputDto'

export interface IDeleteContactUseCase {
  execute(input: DeleteContactInputDto): Promise<void>
}
