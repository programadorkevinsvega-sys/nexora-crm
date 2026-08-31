import { api } from "../../api/api-client"
import type { MetaIntegration, MetaConfigUpdate, MetaLeadAdLog, MetaLeadForm, SimulateMetaLead } from "@crm/contracts"

export const ApiMetaLeadsRepository = {
  async getStatus(): Promise<MetaIntegration> {
    return api.get<MetaIntegration>("/api/integrations/facebook/status")
  },

  async getOAuthUrl(redirectUri?: string): Promise<{ url: string; state: string }> {
    const qs = redirectUri ? `?redirectUri=${encodeURIComponent(redirectUri)}` : ""
    return api.get<{ url: string; state: string }>(`/api/integrations/facebook/oauth-url${qs}`)
  },

  async handleCallback(code: string): Promise<MetaIntegration> {
    return api.post<MetaIntegration>("/api/integrations/facebook/oauth-callback", { code })
  },

  async updateConfig(dto: MetaConfigUpdate): Promise<MetaIntegration> {
    return api.post<MetaIntegration>("/api/integrations/facebook/config", dto)
  },

  async syncForms(): Promise<MetaLeadForm[]> {
    return api.post<MetaLeadForm[]>("/api/integrations/facebook/sync-forms", {})
  },

  async disconnect(): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>("/api/integrations/facebook/disconnect", {})
  },

  async listLogs(): Promise<MetaLeadAdLog[]> {
    return api.get<MetaLeadAdLog[]>("/api/integrations/facebook/logs")
  },

  async simulateLead(dto: SimulateMetaLead): Promise<{ success: boolean; contactId: string; dealId: string | null; log: MetaLeadAdLog }> {
    return api.post<any>("/api/integrations/facebook/simulate", dto)
  },
}
