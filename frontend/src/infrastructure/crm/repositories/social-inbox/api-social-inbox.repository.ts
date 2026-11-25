import { api } from "../../api/api-client"
import type {
  SocialComment,
  SocialAutoResponderRule,
  CreateSocialReplyDto,
  SimulateCommentDto,
} from "@crm/contracts"

export const ApiSocialInboxRepository = {
  async listComments(platform?: string, status?: string): Promise<SocialComment[]> {
    const params = new URLSearchParams()
    if (platform && platform !== "ALL") params.set("platform", platform)
    if (status && status !== "ALL") params.set("status", status)
    const qs = params.toString() ? `?${params.toString()}` : ""
    return api.get<SocialComment[]>(`/api/social-inbox/comments${qs}`)
  },

  async replyComment(dto: CreateSocialReplyDto): Promise<SocialComment> {
    return api.post<SocialComment>("/api/social-inbox/comments/reply", dto)
  },

  async listRules(): Promise<SocialAutoResponderRule[]> {
    return api.get<SocialAutoResponderRule[]>("/api/social-inbox/rules")
  },

  async saveRule(dto: Partial<SocialAutoResponderRule>): Promise<SocialAutoResponderRule> {
    return api.post<SocialAutoResponderRule>("/api/social-inbox/rules", dto)
  },

  async deleteRule(id: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/api/social-inbox/rules/${id}`)
  },

  async simulateComment(dto: SimulateCommentDto): Promise<{
    comment: SocialComment
    matchedRule?: SocialAutoResponderRule | null
    autoReplied: boolean
  }> {
    return api.post<{ comment: SocialComment; matchedRule?: SocialAutoResponderRule | null; autoReplied: boolean }>("/api/social-inbox/simulate", dto)
  },
}
