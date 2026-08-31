import { Injectable, Logger } from '@nestjs/common'
import type { SocialAutoResponderRule } from '@crm/contracts'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class SocialInboxRulesService {
  private readonly logger = new Logger(SocialInboxRulesService.name)

  constructor(private readonly api: ApiCoreGrpcClient) {}

  async listRules(tenantId?: string): Promise<SocialAutoResponderRule[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    return this.api.listRules(tid)
  }

  async saveRule(dto: Partial<SocialAutoResponderRule>, tenantId?: string): Promise<SocialAutoResponderRule> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const input = {
      ...dto,
      tenantId: tid,
    }
    const saved = await this.api.saveRule(input)
    this.logger.log(`${dto.id ? 'Updated' : 'Created'} rule ${saved.id}`)
    return saved
  }

  async deleteRule(ruleId: string, tenantId?: string): Promise<{ success: boolean }> {
    const tid = tenantId || DEFAULT_TENANT_ID
    await this.api.deleteRule(tid, ruleId)
    return { success: true }
  }

  async getEnabledRulesForPlatform(tenantId: string, platform: string): Promise<SocialAutoResponderRule[]> {
    return this.api.getEnabledRulesForPlatform(tenantId, platform)
  }
}
