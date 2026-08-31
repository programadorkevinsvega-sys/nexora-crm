import { Injectable } from '@nestjs/common'
import { PipelineRepository } from '../../domain/repositories/pipeline.repository'
import { PipelineStageRepository } from '../../domain/repositories/pipeline-stage.repository'
import { DealRepository } from '../../domain/repositories/deal.repository'
import { GetPipelineQuery, ListPipelinesQuery, GetPipelineBoardQuery, ListDealsQuery, GetDealQuery } from './pipeline.queries'
import { PipelineMapper } from '../../infrastructure/pipeline.mapper'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class GetPipelineHandler {
  constructor(private readonly repo: PipelineRepository) {}

  async execute(query: GetPipelineQuery) {
    const pipeline = await this.repo.findById(query.tenantId, query.id)
    if (!pipeline) throw new NotFoundError('Pipeline', query.id)
    return pipeline
  }
}

@Injectable()
export class ListPipelinesHandler {
  constructor(private readonly repo: PipelineRepository) {}

  async execute(query: ListPipelinesQuery) {
    return this.repo.list(query.tenantId)
  }
}

@Injectable()
export class GetPipelineBoardHandler {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly stageRepo: PipelineStageRepository,
    private readonly dealRepo: DealRepository,
  ) {}

  async execute(query: GetPipelineBoardQuery) {
    const pipeline = await this.pipelineRepo.findById(query.tenantId, query.id)
    if (!pipeline) throw new NotFoundError('Pipeline', query.id)

    const stages = await this.stageRepo.listOrdered(query.tenantId, query.id)
    const allDeals = await this.dealRepo.list(query.tenantId, { pipelineId: query.id })

    const dealsByStage: Record<string, ReturnType<typeof PipelineMapper.toResponse>[]> = {}
    for (const stage of stages) {
      dealsByStage[stage.id] = allDeals
        .filter(d => d.stageId === stage.id)
        .map(PipelineMapper.toDealResponse)
    }

    return {
      ...PipelineMapper.toResponse(pipeline),
      stages: stages.map(s => ({
        ...PipelineMapper.toStageResponse(s),
        deals: dealsByStage[s.id] ?? [],
      })),
    }
  }
}

@Injectable()
export class ListDealsHandler {
  constructor(private readonly dealRepo: DealRepository) {}

  async execute(query: ListDealsQuery) {
    return this.dealRepo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetDealHandler {
  constructor(private readonly dealRepo: DealRepository) {}

  async execute(query: GetDealQuery) {
    const deal = await this.dealRepo.findById(query.tenantId, query.id)
    if (!deal) throw new NotFoundError('Deal', query.id)
    return deal
  }
}
