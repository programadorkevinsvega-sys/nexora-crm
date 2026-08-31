import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  DealWinProbability,
  GenerateMessageDraft,
  GeneratedMessageDraft,
  ContactExecutiveSummary,
  ChurnRiskPrediction,
} from '@crm/contracts'

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'ai:'

@Injectable()
export class AiBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async getDealWinProbability(
    dealId: string,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<DealWinProbability> {
    const cacheKey = `${CACHE_KEY_PREFIX}deal:${dealId}:${tenantId}`
    return this.cache.getOrSet<DealWinProbability>(
      cacheKey,
      () => this.api.getDealWinProbability(tenantId, dealId),
      CACHE_TTL_MS,
    )
  }

  async generateMessageDraft(
    dto: GenerateMessageDraft,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<GeneratedMessageDraft> {
    return this.api.generateMessageDraft({ tenantId, ...dto })
  }

  async getContactExecutiveSummary(
    contactId: string,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<ContactExecutiveSummary> {
    const cacheKey = `${CACHE_KEY_PREFIX}summary:${contactId}:${tenantId}`
    return this.cache.getOrSet<ContactExecutiveSummary>(
      cacheKey,
      () => this.api.getContactExecutiveSummary(tenantId, contactId),
      CACHE_TTL_MS,
    )
  }

  async getChurnRiskPrediction(
    contactId: string,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<ChurnRiskPrediction> {
    const cacheKey = `${CACHE_KEY_PREFIX}churn:${contactId}:${tenantId}`
    return this.cache.getOrSet<ChurnRiskPrediction>(
      cacheKey,
      () => this.api.getChurnRiskPrediction(tenantId, contactId),
      CACHE_TTL_MS,
    )
  }
}
