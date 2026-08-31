import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  Pipeline, CreatePipeline, PipelineBoard,
  PipelineStage, CreateStage, ReorderStages,
  Deal, CreateDeal, UpdateDeal, DealFilter,
} from '@crm/contracts'

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'pipelines:'

@Injectable()
export class PipelinesBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createPipeline(dto: CreatePipeline, tenantId: string): Promise<Pipeline> {
    const pipeline = await this.api.createPipeline(tenantId, dto.name)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return pipeline
  }

  async listPipelines(tenantId: string): Promise<Pipeline[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}`
    return this.cache.getOrSet<Pipeline[]>(
      cacheKey,
      () => this.api.listPipelines(tenantId),
      CACHE_TTL_MS,
    )
  }

  async getPipelineBoard(id: string, tenantId: string): Promise<PipelineBoard> {
    const cacheKey = `${CACHE_KEY_PREFIX}board:${id}:${tenantId}`
    return this.cache.getOrSet<PipelineBoard>(
      cacheKey,
      () => this.api.getPipelineBoard(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async updatePipeline(id: string, dto: Partial<CreatePipeline>, tenantId: string): Promise<Pipeline> {
    await this.api.updatePipeline(tenantId, id, dto)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getPipelineBoard(tenantId, id) as unknown as Pipeline
  }

  async deletePipeline(id: string, tenantId: string): Promise<void> {
    await this.api.deletePipeline(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async createStage(pipelineId: string, dto: CreateStage, tenantId: string): Promise<PipelineStage> {
    const stage = await this.api.createStage({
      tenantId,
      pipelineId,
      name: dto.name,
      displayOrder: dto.displayOrder,
      probabilityPercent: dto.probabilityPercent,
    })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return stage as unknown as PipelineStage
  }

  async reorderStages(pipelineId: string, dto: ReorderStages, tenantId: string): Promise<PipelineStage[]> {
    const stages = await this.api.reorderStages(tenantId, pipelineId, dto.stageIds)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return stages as unknown as PipelineStage[]
  }

  async listDeals(filters: DealFilter, tenantId: string): Promise<PaginatedResult<Deal>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}deals:${tenantId}:${qs}`

    return this.cache.getOrSet<PaginatedResult<Deal>>(
      cacheKey,
      () => this.api.listDeals({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async createDeal(dto: CreateDeal, tenantId: string): Promise<Deal> {
    const deal = await this.api.createDeal({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return deal
  }

  async getDeal(id: string, tenantId: string): Promise<Deal> {
    const cacheKey = `${CACHE_KEY_PREFIX}deal:${id}:${tenantId}`
    return this.cache.getOrSet<Deal>(
      cacheKey,
      () => this.api.getDeal(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async updateDeal(id: string, dto: UpdateDeal, tenantId: string): Promise<Deal> {
    await this.api.updateDeal({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getDeal(tenantId, id)
  }

  async moveDeal(id: string, stageId: string, tenantId: string): Promise<Deal> {
    const deal = await this.api.moveDeal(tenantId, id, stageId)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return deal
  }

  async winDeal(id: string, amount: number | undefined, tenantId: string): Promise<Deal> {
    const deal = await this.api.winDeal(tenantId, id, amount)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return deal
  }

  async loseDeal(
    id: string,
    lostReasonId: string | undefined,
    lostNotes: string | undefined,
    tenantId: string,
  ): Promise<Deal> {
    const deal = await this.api.loseDeal(tenantId, id, lostReasonId, lostNotes)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return deal
  }

  async deleteDeal(id: string, tenantId: string): Promise<void> {
    await this.api.deleteDeal(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }
}
