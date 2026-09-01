/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, qs } from "../../api/api-client"
import type {
  LifeEvent, CreateLifeEvent,
  Gift, CreateGift,
  Debt, CreateDebt,
  Reminder, CreateReminder,
  Pet, AddPet,
} from "@crm/contracts"

export type { LifeEvent, CreateLifeEvent, Gift, CreateGift, Debt, CreateDebt, Reminder, CreateReminder, Pet, AddPet }
export type GiftIdea = Gift
export type RelationshipReminder = Reminder

export class ApiPersonalCrmRepository {
  static async listLifeEvents(params?: { contactId?: string } | string): Promise<{ data: LifeEvent[] }> {
    const contactId = typeof params === 'string' ? params : params?.contactId
    const url = `/api/personal-crm/life-events${qs({ contactId })}`
    const res = await api.get<any>(url)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [] }
  }

  static async createLifeEvent(dto: CreateLifeEvent): Promise<LifeEvent> {
    return api.post<LifeEvent>('/api/personal-crm/life-events', dto)
  }

  static async listGifts(params?: { contactId?: string } | string): Promise<{ data: Gift[] }> {
    const contactId = typeof params === 'string' ? params : params?.contactId
    const url = `/api/personal-crm/gifts${qs({ contactId })}`
    const res = await api.get<any>(url)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [] }
  }

  static async createGift(dto: CreateGift): Promise<Gift> {
    return api.post<Gift>('/api/personal-crm/gifts', dto)
  }

  static async listDebts(params?: { contactId?: string } | string): Promise<{ data: Debt[] }> {
    const contactId = typeof params === 'string' ? params : params?.contactId
    const url = `/api/personal-crm/debts${qs({ contactId })}`
    const res = await api.get<any>(url)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [] }
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
    const res = await api.get<any>(url)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [] }
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
    const res = await api.get<any>(url)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [] }
  }

  static async addPet(dto: AddPet): Promise<Pet> {
    return api.post<Pet>('/api/personal-crm/pets', dto)
  }
}
