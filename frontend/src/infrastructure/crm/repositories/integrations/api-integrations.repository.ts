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

  async saveConfig(
    providerOrInput: IntegrationProvider | SaveIntegrationInput,
    credentials?: Record<string, unknown>,
    isEnabled = true,
  ): Promise<{ ok: boolean }> {
    let payload: SaveIntegrationInput
    if (typeof providerOrInput === 'object') {
      payload = providerOrInput
    } else {
      payload = { provider: providerOrInput, credentials: credentials || {}, isEnabled }
    }
    return api.post<{ ok: boolean }>(`/api/integrations/${payload.provider}`, payload)
  },

  async testIntegration(
    provider: IntegrationProvider,
    recipient: string,
    testMessage?: string,
  ): Promise<{ success: boolean; message: string; details?: unknown }> {
    const payload: TestIntegrationInput = { provider, recipient, testMessage }
    return api.post<{ success: boolean; message: string; details?: any }>(
      `/api/integrations/${provider}/test`,
      payload,
    )
  },

  async deleteConfig(provider: IntegrationProvider): Promise<{ ok: boolean }> {
    return api.delete<{ ok: boolean }>(`/api/integrations/${provider}`)
  },
}
