import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CacheService } from '../../common/cache/cache.service'
import { IntegrationsDispatcher } from './integrations.dispatcher'
import { SecretsVault } from '@crm/shared'
import {
  INTEGRATION_PROVIDERS,
  IntegrationProvider,
  IntegrationStatus,
  SaveIntegrationInput,
  TestIntegrationInput,
} from '@crm/contracts'

@Injectable()
interface StoredIntegrationConfig {
  provider: IntegrationProvider
  credentials: Record<string, unknown>
  isEnabled: boolean
  updatedAt: string
  lastTestedAt?: string | null
  lastTestSuccess?: boolean | null
}
type IntegrationTestResult = Awaited<ReturnType<IntegrationsDispatcher['dispatchTest']>>

export class IntegrationsBffService {
  private readonly logger = new Logger(IntegrationsBffService.name)

  constructor(
    private readonly cache: CacheService,
    private readonly dispatcher: IntegrationsDispatcher
  ) {}

  private key(tenantId: string, provider: IntegrationProvider): string {
    return `integration:${tenantId}:${provider}`
  }

  async listStatuses(tenantId: string): Promise<IntegrationStatus[]> {
    const statuses: IntegrationStatus[] = []

    for (const provider of INTEGRATION_PROVIDERS) {
      const stored = await this.cache.get<StoredIntegrationConfig>(this.key(tenantId, provider))
      const isConfigured = !!stored
      const isEnabled = stored?.isEnabled ?? false

      const maskedDetails: Record<string, string> = {}
      if (stored?.credentials) {
        for (const [k, v] of Object.entries(stored.credentials)) {
          if (typeof v === 'string') {
            maskedDetails[k] = SecretsVault.mask(v, tenantId)
          }
        }
      }

      statuses.push({
        provider,
        isConfigured,
        isEnabled,
        maskedDetails: isConfigured ? maskedDetails : undefined,
        lastTestedAt: stored?.lastTestedAt || null,
        lastTestSuccess: stored?.lastTestSuccess || null,
        webhookUrl: provider === 'WHATSAPP_CLOUD' ? 'http://localhost:3006/api/webhooks/whatsapp' : undefined,
      })
    }

    return statuses
  }

  async saveConfig(tenantId: string, input: SaveIntegrationInput): Promise<{ ok: boolean }> {
    // Encrypt sensitive credential fields using AES-256-GCM + tenant isolation
    const encryptedCredentials: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input.credentials)) {
      if (typeof v === 'string' && v.trim().length > 0) {
        encryptedCredentials[k] = SecretsVault.encrypt(v, tenantId)
      } else {
        encryptedCredentials[k] = v
      }
    }

    const data = {
      provider: input.provider,
      credentials: encryptedCredentials,
      isEnabled: input.isEnabled,
      updatedAt: new Date().toISOString(),
    }

    await this.cache.set(this.key(tenantId, input.provider), data, 86400 * 365)
    this.logger.log(`Tenant ${tenantId} updated integration ${input.provider} with AES-256-GCM vault`)
    return { ok: true }
  }

  async testIntegration(tenantId: string, input: TestIntegrationInput): Promise<IntegrationTestResult> {
    const stored = await this.cache.get<StoredIntegrationConfig>(this.key(tenantId, input.provider))
    const creds = stored?.credentials

    if (!creds) {
      throw new NotFoundException(`No hay credenciales guardadas para ${input.provider}. Guarda la configuración primero.`)
    }

    // Decrypt credentials with authentication tag verification
    const decryptedCreds: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(creds)) {
      if (typeof v === 'string' && SecretsVault.isEncrypted(v)) {
        decryptedCreds[k] = SecretsVault.decrypt(v, tenantId)
      } else {
        decryptedCreds[k] = v
      }
    }

    const result = await this.dispatcher.dispatchTest(
      input.provider,
      decryptedCreds,
      input.recipient,
      input.testMessage
    )

    // Update last test status
    stored.lastTestedAt = new Date().toISOString()
    stored.lastTestSuccess = result.success
    await this.cache.set(this.key(tenantId, input.provider), stored, 86400 * 365)

    return result
  }

  async deleteConfig(tenantId: string, provider: IntegrationProvider): Promise<{ ok: boolean }> {
    await this.cache.delete(this.key(tenantId, provider))
    return { ok: true }
  }

  async getDecryptedConfig(tenantId: string, provider: IntegrationProvider): Promise<Record<string, unknown> | null> {
    const stored = await this.cache.get<StoredIntegrationConfig>(this.key(tenantId, provider))
    const creds = stored?.credentials
    if (!creds || stored?.isEnabled === false) return null

    const decryptedCreds: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(creds)) {
      if (typeof v === 'string' && SecretsVault.isEncrypted(v)) {
        decryptedCreds[k] = SecretsVault.decrypt(v, tenantId)
      } else {
        decryptedCreds[k] = v
      }
    }
    return decryptedCreds
  }
}
