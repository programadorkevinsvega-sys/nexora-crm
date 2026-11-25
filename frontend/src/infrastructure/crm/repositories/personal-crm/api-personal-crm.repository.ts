import { api, qs } from "../../api/api-client"
import type {
  LifeEvent, CreateLifeEvent,
  Gift, CreateGift,
  Debt, CreateDebt,
  Reminder, CreateReminder,
  Pet, AddPet,
} from "@crm/contracts"
import { LifeEventSchema, GiftSchema, DebtSchema, ReminderSchema, PetSchema } from "@crm/contracts"
import type { z } from "zod"

export type { LifeEvent, CreateLifeEvent, Gift, CreateGift, Debt, CreateDebt, Reminder, CreateReminder, Pet, AddPet }
export type GiftIdea = Gift
export type RelationshipReminder = Reminder

function parseList<T>(response: unknown, schema: z.ZodType<T>): { data: T[] } {
  const rows = Array.isArray(response)
    ? response
    : typeof response === 'object' && response !== null && 'data' in response && Array.isArray(response.data)
      ? response.data
      : []
  return { data: schema.array().parse(rows) }
}

export class ApiPersonalCrmRepository {
  static async listLifeEvents(params?: { contactId?: string } | string): Promise<{ data: LifeEvent[] }> {
    const contactId = typeof params === 'string' ? params : params?.contactId
    const url = `/api/personal-crm/life-events${qs({ contactId })}`
    const res: unknown = await api.get<unknown>(url)
    return parseList(res, LifeEventSchema)
  }

  static async createLifeEvent(dto: CreateLifeEvent): Promise<LifeEvent> {
    return api.post<LifeEvent>('/api/personal-crm/life-events', dto)
  }

  static async listGifts(params?: { contactId?: string } | string): Promise<{ data: Gift[] }> {
    const contactId = typeof params === 'string' ? params : params?.contactId
    const url = `/api/personal-crm/gifts${qs({ contactId })}`
    const res: unknown = await api.get<unknown>(url)
    return parseList(res, GiftSchema)
  }

  static async createGift(dto: CreateGift): Promise<Gift> {
    return api.post<Gift>('/api/personal-crm/gifts', dto)
  }

  static async listDebts(params?: { contactId?: string } | string): Promise<{ data: Debt[] }> {
    const contactId = typeof params === 'string' ? params : params?.contactId
    const url = `/api/personal-crm/debts${qs({ contactId })}`
    const res: unknown = await api.get<unknown>(url)
    return parseList(res, DebtSchema)
  }

  static async createDebt(dto: CreateDebt): Promise<Debt> {
    return api.post<Debt>('/api/personal-crm/debts', dto)
  }

  static async settleDebt(id: string): Promise<void> {
    await api.post(`/api/personal-crm/debts/${id}/settle`, {})
  }

  static async listReminders(params?: { contactId?: string } | string): Promise<{ data: Reminder[] }> {
    const contactId = typeof params === 'string' ? params : params?.contactId
    const url = `/api/personal-crm/reminders${qs({ contactId })}`
    const res: unknown = await api.get<unknown>(url)
    return parseList(res, ReminderSchema)
  }

  static async createReminder(dto: CreateReminder): Promise<Reminder> {
    return api.post<Reminder>('/api/personal-crm/reminders', dto)
  }

  static async toggleReminder(id: string): Promise<void> {
    await api.post(`/api/personal-crm/reminders/${id}/toggle`, {})
  }

  static async listPets(params?: { contactId?: string } | string): Promise<{ data: Pet[] }> {
    const contactId = typeof params === 'string' ? params : params?.contactId
    const url = `/api/personal-crm/pets${qs({ contactId })}`
    const res: unknown = await api.get<unknown>(url)
    return parseList(res, PetSchema)
  }

  static async addPet(dto: AddPet): Promise<Pet> {
    return api.post<Pet>('/api/personal-crm/pets', dto)
  }
}
