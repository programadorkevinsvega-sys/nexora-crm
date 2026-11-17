import { api } from "../../api/api-client"
import type { InboxConversation, InboxMessage, SendInboxMessage } from "@crm/contracts"

export const ApiInboxRepository = {
  async listConversations(params?: { channel?: string; status?: string }): Promise<InboxConversation[]> {
    const query = new URLSearchParams()
    if (params?.channel) query.set("channel", params.channel)
    if (params?.status) query.set("status", params.status)
    const qs = query.toString() ? `?${query.toString()}` : ""
    const res = await api.get<any>(`/api/inbox/conversations${qs}`)
    return Array.isArray(res) ? res : []
  },

  async getConversation(id: string): Promise<InboxConversation> {
    return api.get<InboxConversation>(`/api/inbox/conversations/${id}`)
  },

  async sendMessage(data: SendInboxMessage): Promise<InboxMessage> {
    return api.post<InboxMessage>("/api/inbox/messages", data)
  },
}
