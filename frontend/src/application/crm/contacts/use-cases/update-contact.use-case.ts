import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IContactRepository } from "@/src/domain/crm/contacts/contact.repository"
import type { Contact, ContactUpdateInput } from "@/src/domain/crm/contacts/contact.entity"

export class UpdateContactUseCase {
  constructor(private repository: IContactRepository) {}

  async execute(id: string, data: ContactUpdateInput): Promise<Result<Contact>> {
    try {
      const contact = await this.repository.update(id, data)
      return success(contact)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
