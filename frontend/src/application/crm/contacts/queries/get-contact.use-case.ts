import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IContactRepository } from "@/src/domain/crm/contacts/contact.repository"
import type { Contact } from "@/src/domain/crm/contacts/contact.entity"

export class GetContactUseCase {
  constructor(private repository: IContactRepository) {}

  async execute(id: string): Promise<Result<Contact | null>> {
    try {
      const contact = await this.repository.getById(id)
      return success(contact)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
