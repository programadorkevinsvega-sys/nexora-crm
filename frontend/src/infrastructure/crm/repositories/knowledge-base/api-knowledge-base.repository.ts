import { api } from "../../api/api-client"
import type {
  KnowledgeBaseCategory,
  CreateKnowledgeBaseCategory,
  KnowledgeBaseArticle,
  CreateKnowledgeBaseArticle,
} from "@crm/contracts"

export const ApiKnowledgeBaseRepository = {
  async listCategories(): Promise<KnowledgeBaseCategory[]> {
    const res = await api.get<any>("/api/kb/categories")
    return Array.isArray(res) ? res : []
  },

  async createCategory(data: CreateKnowledgeBaseCategory): Promise<KnowledgeBaseCategory> {
    return api.post<KnowledgeBaseCategory>("/api/kb/categories", data)
  },

  async listArticles(params?: { categoryId?: string; query?: string; publicOnly?: boolean }): Promise<KnowledgeBaseArticle[]> {
    const query = new URLSearchParams()
    if (params?.categoryId) query.set("categoryId", params.categoryId)
    if (params?.query) query.set("query", params.query)
    if (params?.publicOnly !== undefined) query.set("publicOnly", String(params.publicOnly))
    const qs = query.toString() ? `?${query.toString()}` : ""
    const res = await api.get<any>(`/api/kb/articles${qs}`)
    return Array.isArray(res) ? res : []
  },

  async getArticle(idOrSlug: string): Promise<KnowledgeBaseArticle> {
    return api.get<KnowledgeBaseArticle>(`/api/kb/articles/${idOrSlug}`)
  },

  async createArticle(data: CreateKnowledgeBaseArticle): Promise<KnowledgeBaseArticle> {
    return api.post<KnowledgeBaseArticle>("/api/kb/articles", data)
  },

  async voteArticle(articleId: string, isHelpful: boolean): Promise<KnowledgeBaseArticle> {
    return api.post<KnowledgeBaseArticle>(`/api/kb/articles/${articleId}/vote`, { isHelpful })
  },


}
