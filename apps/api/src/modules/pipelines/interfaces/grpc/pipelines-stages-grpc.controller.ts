import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreatePipelineHandler, UpdatePipelineHandler, DeletePipelineHandler,
  CreateStageHandler, ReorderStagesHandler,
} from '../../application/commands/pipeline.handlers'
import {
  GetPipelineHandler, ListPipelinesHandler, GetPipelineBoardHandler,
} from '../../application/queries/pipeline.handlers'
import {
  CreatePipelineCommand, UpdatePipelineCommand, DeletePipelineCommand,
  CreateStageCommand, ReorderStagesCommand,
} from '../../application/commands/pipeline.commands'
import {
  GetPipelineQuery, ListPipelinesQuery, GetPipelineBoardQuery,
} from '../../application/queries/pipeline.queries'
import { PipelineMapper } from '../../infrastructure/pipeline.mapper'

@Controller()
export class PipelinesStagesGrpcController {
  constructor(
    private readonly createPipelineHandler: CreatePipelineHandler,
    private readonly updatePipelineHandler: UpdatePipelineHandler,
    private readonly deletePipelineHandler: DeletePipelineHandler,
    private readonly createStageHandler: CreateStageHandler,
    private readonly reorderStagesHandler: ReorderStagesHandler,
    private readonly getPipelineHandler: GetPipelineHandler,
    private readonly listPipelinesHandler: ListPipelinesHandler,
    private readonly getPipelineBoardHandler: GetPipelineBoardHandler,
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
      jsonItems: pipelines.map((pipeline) => JSON.stringify(PipelineMapper.toResponse(pipeline))),
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
    const createdStage = board.stages.find((stage) => stage.id === result.id)

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
      jsonItems: board.stages.map((stage) => JSON.stringify(stage)),
    }
  }
}
