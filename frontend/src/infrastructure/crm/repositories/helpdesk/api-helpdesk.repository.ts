import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { ConversationFilters } from "@/src/domain/crm/helpdesk/conversation.repository"
import type { Conversation, ConversationCreateInput, ConversationUpdateInput } from "@/src/domain/crm/helpdesk/conversation.entity"
import type { Mailbox, MailboxCreateInput, MailboxUpdateInput } from "@/src/domain/crm/helpdesk/mailbox.entity"
import type { Thread, ThreadCreateInput } from "@/src/domain/crm/helpdesk/thread.entity"

export const ApiHelpdeskRepository = {
  async list(filters: ConversationFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Conversation>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Conversation>>(`/api/helpdesk/conversations${qs(params)}`)
  },
  async getById(id: string): Promise<Conversation> {
    return api.get<Conversation>(`/api/helpdesk/conversations/${id}`)
  },
  async create(data: ConversationCreateInput): Promise<Conversation> {
    return api.post<Conversation>("/api/helpdesk/conversations", data)
  },
  async update(id: string, data: ConversationUpdateInput): Promise<Conversation> {
    return api.put<Conversation>(`/api/helpdesk/conversations/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/helpdesk/conversations/${id}`)
  },

  async listConversations(filters: ConversationFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Conversation>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Conversation>>(`/api/helpdesk/conversations${qs(params)}`)
  },
  async getConversationById(id: string): Promise<Conversation> {
    return api.get<Conversation>(`/api/helpdesk/conversations/${id}`)
  },
  async createConversation(data: ConversationCreateInput): Promise<Conversation> {
    return api.post<Conversation>("/api/helpdesk/conversations", data)
  },
  async updateConversation(id: string, data: ConversationUpdateInput): Promise<Conversation> {
    return api.put<Conversation>(`/api/helpdesk/conversations/${id}`, data)
  },
  async deleteConversation(id: string): Promise<void> {
    return api.delete(`/api/helpdesk/conversations/${id}`)
  },
  async assignConversation(id: string, assigneeUserId: string): Promise<Conversation> {
    return api.put<Conversation>(`/api/helpdesk/conversations/${id}/assign`, { assigneeUserId })
  },
  async assign(id: string, assigneeUserId: string): Promise<Conversation> {
    return api.put<Conversation>(`/api/helpdesk/conversations/${id}/assign`, { assigneeUserId })
  },
  async resolveConversation(id: string): Promise<Conversation> {
    return api.put<Conversation>(`/api/helpdesk/conversations/${id}/resolve`, {})
  },
  async resolve(id: string): Promise<Conversation> {
    return api.put<Conversation>(`/api/helpdesk/conversations/${id}/resolve`, {})
  },
  async closeConversation(id: string): Promise<Conversation> {
    return api.put<Conversation>(`/api/helpdesk/conversations/${id}/close`, {})
  },
  async close(id: string): Promise<Conversation> {
    return api.put<Conversation>(`/api/helpdesk/conversations/${id}/close`, {})
  },

  async listThreads(conversationId: string, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Thread>> {
    const params = { cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Thread>>(`/api/helpdesk/conversations/${conversationId}/threads${qs(params)}`)
  },
  async createThread(data: ThreadCreateInput): Promise<Thread> {
    return api.post<Thread>(`/api/helpdesk/conversations/${data.conversationId}/threads`, data)
  },

  async listMailboxes(pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Mailbox>> {
    const params = { cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Mailbox>>(`/api/helpdesk/mailboxes${qs(params)}`)
  },
  async createMailbox(data: MailboxCreateInput): Promise<Mailbox> {
    return api.post<Mailbox>("/api/helpdesk/mailboxes", data)
  },
  async updateMailbox(id: string, data: MailboxUpdateInput): Promise<Mailbox> {
    return api.put<Mailbox>(`/api/helpdesk/mailboxes/${id}`, data)
  },
}

export const ApiMailboxRepository = {
  async list(): Promise<PaginatedResult<Mailbox>> {
    return ApiHelpdeskRepository.listMailboxes()
  },
  async create(data: MailboxCreateInput): Promise<Mailbox> {
    return ApiHelpdeskRepository.createMailbox(data)
  },
  async update(id: string, data: MailboxUpdateInput): Promise<Mailbox> {
    return ApiHelpdeskRepository.updateMailbox(id, data)
  },
}

export const ApiThreadRepository = {
  async listByConversationId(conversationId: string, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Thread>> {
    return ApiHelpdeskRepository.listThreads(conversationId, pagination)
  },
  async create(data: ThreadCreateInput): Promise<Thread> {
    return ApiHelpdeskRepository.createThread(data)
  },
}
