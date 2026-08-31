import { api } from "../../api/api-client"
import type { WebForm, CreateWebForm, UpdateWebForm } from "@crm/contracts"

export interface WebFormSubmission {
  id: string
  tenantId: string
  formId: string
  contactId: string | null
  payloadJson: Record<string, any>
  ipAddress: string | null
  userAgent: string | null
  submittedAt: string
}

export const ApiWebFormsRepository = {
  async list(): Promise<WebForm[]> {
    return api.get<WebForm[]>("/api/forms")
  },
  async getById(id: string): Promise<WebForm> {
    return api.get<WebForm>(`/api/forms/${id}`)
  },
  async create(data: CreateWebForm): Promise<WebForm> {
    return api.post<WebForm>("/api/forms", data)
  },
  async update(id: string, data: UpdateWebForm): Promise<WebForm> {
    return api.put<WebForm>(`/api/forms/${id}`, data)
  },
  async delete(id: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/api/forms/${id}`)
  },
  async getSubmissions(formId: string): Promise<WebFormSubmission[]> {
    return api.get<WebFormSubmission[]>(`/api/forms/${formId}/submissions`)
  },
  async getPublicForm(idOrSlug: string): Promise<WebForm> {
    return api.get<WebForm>(`/api/public/forms/${idOrSlug}`)
  },
  async submitPublic(idOrSlug: string, formData: Record<string, any>) {
    return api.post<{ success: boolean; message: string; redirectUrl: string | null; contactId?: string }>(
      `/api/public/forms/${idOrSlug}/submit`,
      { formData },
    )
  },
}
