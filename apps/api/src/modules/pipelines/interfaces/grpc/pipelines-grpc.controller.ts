import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreatePipelineHandler, UpdatePipelineHandler, DeletePipelineHandler,
  CreateStageHandler, ReorderStagesHandler,
  CreateDealHandler, UpdateDealHandler, MoveDealHandler, WinDealHandler, LoseDealHandler, DeleteDealHandler,
} from '../../application/commands/pipeline.handlers'
import {
  GetPipelineHandler, ListPipelinesHandler, GetPipelineBoardHandler,
  ListDealsHandler, GetDealHandler,
} from '../../application/queries/pipeline.handlers'
import {
  CreatePipelineCommand, UpdatePipelineCommand, DeletePipelineCommand,
  CreateStageCommand, ReorderStagesCommand,
  CreateDealCommand, UpdateDealCommand, MoveDealCommand, WinDealCommand, LoseDealCommand, DeleteDealCommand,
} from '../../application/commands/pipeline.commands'
import {
  GetPipelineQuery, ListPipelinesQuery, GetPipelineBoardQuery,
  ListDealsQuery, GetDealQuery,
} from '../../application/queries/pipeline.queries'
import { PipelineMapper } from '../../infrastructure/pipeline.mapper'
import { DealStatus } from '../../domain/entities/deal.entity'

@Controller()
export class PipelinesGrpcController {
  constructor(
    private readonly createPipelineHandler: CreatePipelineHandler,
    private readonly updatePipelineHandler: UpdatePipelineHandler,
    private readonly deletePipelineHandler: DeletePipelineHandler,
    private readonly createStageHandler: CreateStageHandler,
    private readonly reorderStagesHandler: ReorderStagesHandler,
    private readonly createDealHandler: CreateDealHandler,
    private readonly updateDealHandler: UpdateDealHandler,
    private readonly moveDealHandler: MoveDealHandler,
    private readonly winDealHandler: WinDealHandler,
    private readonly loseDealHandler: LoseDealHandler,
    private readonly deleteDealHandler: DeleteDealHandler,
    private readonly getPipelineHandler: GetPipelineHandler,
    private readonly listPipelinesHandler: ListPipelinesHandler,
    private readonly getPipelineBoardHandler: GetPipelineBoardHandler,
    private readonly listDealsHandler: ListDealsHandler,
    private readonly getDealHandler: GetDealHandler,
  ) {}

  @GrpcMethod('PipelineService', 'CreatePipeline')
  async createPipeline(data: { tenantId: string; name: string }) {
    const result = await this.createPipelineHandler.execute(
      new CreatePipelineCommand(data.tenantId, data.name),
    )
    const pipeline = await this.getPipelineHandler.execute(
      new GetPipelineQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(PipelineMapper.toResponse(pipeline)) }
  }

  @GrpcMethod('PipelineService', 'ListPipelines')
  async listPipelines(data: { tenantId: string }) {
    const pipelines = await this.listPipelinesHandler.execute(
      new ListPipelinesQuery(data.tenantId),
    )
    return {
      jsonItems: pipelines.map(pipeline => JSON.stringify(PipelineMapper.toResponse(pipeline))),
    }
  }

  @GrpcMethod('PipelineService', 'GetPipelineBoard')
  async getPipelineBoard(data: { tenantId: string; id: string }) {
    const board = await this.getPipelineBoardHandler.execute(
      new GetPipelineBoardQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(board) }
  }

  @GrpcMethod('PipelineService', 'UpdatePipeline')
  async updatePipeline(data: { tenantId: string; id: string; name?: string }) {
    await this.updatePipelineHandler.execute(
      new UpdatePipelineCommand(data.tenantId, data.id, data.name),
    )
    return {}
  }

  @GrpcMethod('PipelineService', 'DeletePipeline')
  async deletePipeline(data: { tenantId: string; id: string }) {
    await this.deletePipelineHandler.execute(
      new DeletePipelineCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('PipelineService', 'CreateStage')
  async createStage(data: {
    tenantId: string
    pipelineId: string
    name: string
    displayOrder: number
    probabilityPercent?: number
  }) {
    const result = await this.createStageHandler.execute(
      new CreateStageCommand(
        data.tenantId,
        data.pipelineId,
        data.name,
        data.probabilityPercent,
        data.displayOrder,
      ),
    )

    const board = await this.getPipelineBoardHandler.execute(
      new GetPipelineBoardQuery(data.tenantId, data.pipelineId),
    )
    const createdStage = board.stages.find(stage => stage.id === result.id)

    return {
      json: JSON.stringify(createdStage ?? { id: result.id }),
    }
  }

  @GrpcMethod('PipelineService', 'ReorderStages')
  async reorderStages(data: { tenantId: string; pipelineId: string; stageIds: string[] }) {
    await this.reorderStagesHandler.execute(
      new ReorderStagesCommand(data.tenantId, data.pipelineId, data.stageIds),
    )

    const board = await this.getPipelineBoardHandler.execute(
      new GetPipelineBoardQuery(data.tenantId, data.pipelineId),
    )
    return {
      jsonItems: board.stages.map(stage => JSON.stringify(stage)),
    }
  }

  @GrpcMethod('PipelineService', 'CreateDeal')
  async createDeal(data: {
    tenantId: string
    pipelineId: string
    stageId: string
    contactId?: string
    companyId?: string
    name: string
    amount?: number
    expectedCloseDate?: string
    assignedUserId?: string
  }) {
    const result = await this.createDealHandler.execute(
      new CreateDealCommand(
        data.tenantId,
        data.pipelineId,
        data.stageId,
        data.name,
        data.contactId,
        data.companyId,
        data.amount,
        data.expectedCloseDate,
        data.assignedUserId,
      ),
    )

    const deal = await this.getDealHandler.execute(
      new GetDealQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(PipelineMapper.toDealResponse(deal)) }
  }

  @GrpcMethod('PipelineService', 'GetDeal')
  async getDeal(data: { tenantId: string; id: string }) {
    const deal = await this.getDealHandler.execute(
      new GetDealQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(PipelineMapper.toDealResponse(deal)) }
  }

  @GrpcMethod('PipelineService', 'ListDeals')
  async listDeals(data: {
    tenantId: string
    pipelineId?: string
    stageId?: string
    status?: string
    contactId?: string
    companyId?: string
    assignedUserId?: string
    search?: string
  }) {
    const deals = await this.listDealsHandler.execute(
      new ListDealsQuery(data.tenantId, {
        pipelineId: data.pipelineId,
        stageId: data.stageId,
        status: data.status as DealStatus | undefined,
        contactId: data.contactId,
        companyId: data.companyId,
        assignedUserId: data.assignedUserId,
        search: data.search,
      }),
    )

    return {
      jsonItems: deals.map(deal => JSON.stringify(PipelineMapper.toDealResponse(deal))),
    }
  }

  @GrpcMethod('PipelineService', 'UpdateDeal')
  async updateDeal(data: {
    tenantId: string
    id: string
    name?: string
    amount?: number
    stageId?: string
    expectedCloseDate?: string
    assignedUserId?: string
  }) {
    await this.updateDealHandler.execute(
      new UpdateDealCommand(
        data.tenantId,
        data.id,
        data.name,
        data.stageId,
        undefined,
        undefined,
        data.amount,
        data.expectedCloseDate,
        data.assignedUserId,
      ),
    )
    return {}
  }

  @GrpcMethod('PipelineService', 'MoveDeal')
  async moveDeal(data: { tenantId: string; id: string; stageId: string }) {
    await this.moveDealHandler.execute(
      new MoveDealCommand(data.tenantId, data.id, data.stageId),
    )
    const deal = await this.getDealHandler.execute(
      new GetDealQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(PipelineMapper.toDealResponse(deal)) }
  }

  @GrpcMethod('PipelineService', 'WinDeal')
  async winDeal(data: { tenantId: string; id: string; amount?: number }) {
    await this.winDealHandler.execute(
      new WinDealCommand(data.tenantId, data.id, data.amount),
    )
    const deal = await this.getDealHandler.execute(
      new GetDealQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(PipelineMapper.toDealResponse(deal)) }
  }

  @GrpcMethod('PipelineService', 'LoseDeal')
  async loseDeal(data: {
    tenantId: string
    id: string
    lostReasonId?: string
    lostNotes?: string
  }) {
    await this.loseDealHandler.execute(
      new LoseDealCommand(data.tenantId, data.id, data.lostReasonId, data.lostNotes),
    )
    const deal = await this.getDealHandler.execute(
      new GetDealQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(PipelineMapper.toDealResponse(deal)) }
  }

  @GrpcMethod('PipelineService', 'DeleteDeal')
  async deleteDeal(data: { tenantId: string; id: string }) {
    await this.deleteDealHandler.execute(
      new DeleteDealCommand(data.tenantId, data.id),
    )
    return {}
  }
}
