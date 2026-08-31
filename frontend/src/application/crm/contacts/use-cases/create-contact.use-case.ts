import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IContactRepository } from "@/src/domain/crm/contacts/contact.repository"
import type { Contact, ContactCreateInput } from "@/src/domain/crm/contacts/contact.entity"

export class CreateContactUseCase {
  constructor(private repository: IContactRepository) {}

  async execute(data: ContactCreateInput): Promise<Result<Contact>> {
    try {
      const contact = await this.repository.create(data)
      return success(contact)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
