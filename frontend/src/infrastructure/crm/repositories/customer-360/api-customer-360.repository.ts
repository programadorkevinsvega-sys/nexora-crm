import { api } from "../../api/api-client"
import type { Customer360Profile } from "@crm/contracts"

export const ApiCustomer360Repository = {
  async getCustomer360(contactId: string): Promise<Customer360Profile> {
    return api.get<Customer360Profile>(`/api/contacts/${contactId}/360`)
  },
}
