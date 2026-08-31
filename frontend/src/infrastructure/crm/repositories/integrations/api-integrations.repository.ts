import { api } from '../../api/api-client'
import type {
  IntegrationProvider,
  IntegrationStatus,
  SaveIntegrationInput,
  TestIntegrationInput,
} from '@crm/contracts'

export const ApiIntegrationsRepository = {
  async listStatuses(): Promise<IntegrationStatus[]> {
    return api.get<IntegrationStatus[]>('/api/integrations')
  },

  async saveConfig(provider: IntegrationProvider, credentials: Record<string, any>, isEnabled = true): Promise<{ ok: boolean }> {
    const payload: SaveIntegrationInput = { provider, credentials, isEnabled }
    return api.post<{ ok: boolean }>(`/api/integrations/${provider}`, payload)
  },

  async testIntegration(provider: IntegrationProvider, recipient: string, testMessage?: string): Promise<{ success: boolean; message: string; details?: any }> {
    const payload: TestIntegrationInput = { provider, recipient, testMessage }
    return api.post<{ success: boolean; message: string; details?: any }>(`/api/integrations/${provider}/test`, payload)
  },

  async deleteConfig(provider: IntegrationProvider): Promise<{ ok: boolean }> {
    return api.delete<{ ok: boolean }>(`/api/integrations/${provider}`)
  },
}
