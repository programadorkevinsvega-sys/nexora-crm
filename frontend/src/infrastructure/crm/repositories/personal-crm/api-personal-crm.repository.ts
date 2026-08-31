import { api, qs } from "../../api/api-client"

export interface LifeEvent {
  id: string
  contactId: string
  title: string
  type: string
  eventDate: string
  description?: string
  reminderDaysBefore?: number
  createdAt: string
}

export interface GiftIdea {
  id: string
  contactId: string
  name: string
  price?: number
  url?: string
  status: string
  occasion?: string
  createdAt: string
}

export interface RelationshipReminder {
  id: string
  contactId: string
  title: string
  dueDate: string
  completed: boolean
  createdAt: string
}

export interface ContactPet {
  id: string
  contactId: string
  name: string
  type: string
  breed?: string
}

export class ApiPersonalCrmRepository {
  static async listLifeEvents(contactId?: string): Promise<{ data: LifeEvent[] }> {
    const url = `/api/personal-crm/life-events${qs({ contactId })}`
    const res = await api.get<any>(url)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [] }
  }

  static async createLifeEvent(dto: { contactId: string; title: string; type: string; eventDate: string; description?: string }): Promise<LifeEvent> {
    return api.post<LifeEvent>('/api/personal-crm/life-events', dto)
  }

  static async listGifts(contactId?: string): Promise<{ data: GiftIdea[] }> {
    const url = `/api/personal-crm/gifts${qs({ contactId })}`
    const res = await api.get<any>(url)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [] }
  }

  static async createGift(dto: { contactId: string; name: string; price?: number; occasion?: string }): Promise<GiftIdea> {
    return api.post<GiftIdea>('/api/personal-crm/gifts', dto)
  }

  static async listReminders(contactId?: string): Promise<{ data: RelationshipReminder[] }> {
    const url = `/api/personal-crm/reminders${qs({ contactId })}`
    const res = await api.get<any>(url)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [] }
  }

  static async createReminder(dto: { contactId: string; title: string; dueDate: string }): Promise<RelationshipReminder> {
    return api.post<RelationshipReminder>('/api/personal-crm/reminders', dto)
  }

  static async toggleReminder(id: string): Promise<void> {
    await api.post(`/api/personal-crm/reminders/${id}/toggle`, {})
  }
}
