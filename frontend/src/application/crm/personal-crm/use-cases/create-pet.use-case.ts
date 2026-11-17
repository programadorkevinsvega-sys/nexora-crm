import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PetRepository } from "@/src/domain/crm/personal-crm/pet.repository"
import type { Pet, PetCreateInput } from "@/src/domain/crm/personal-crm/pet.entity"

export class CreatePetUseCase {
  constructor(private repository: PetRepository) {}

  async execute(data: PetCreateInput): Promise<Result<Pet>> {
    try {
      const pet = await this.repository.create(data)
      return success(pet)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
