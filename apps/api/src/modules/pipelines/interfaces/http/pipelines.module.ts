import { Module } from '@nestjs/common'
import { PipelinesController } from './pipelines.controller'
import { PipelinesGrpcController } from '../grpc/pipelines-grpc.controller'
import {
  CreatePipelineHandler, UpdatePipelineHandler, DeletePipelineHandler,
  CreateStageHandler, ReorderStagesHandler,
  CreateDealHandler, UpdateDealHandler, MoveDealHandler, WinDealHandler, LoseDealHandler, DeleteDealHandler,
} from '../../application/commands/pipeline.handlers'
import {
  GetPipelineHandler, ListPipelinesHandler, GetPipelineBoardHandler,
  ListDealsHandler, GetDealHandler,
} from '../../application/queries/pipeline.handlers'
import { PipelineRepository } from '../../domain/repositories/pipeline.repository'
import { PipelineStageRepository } from '../../domain/repositories/pipeline-stage.repository'
import { DealRepository } from '../../domain/repositories/deal.repository'
import { DrizzlePipelineRepository } from '../../infrastructure/drizzle-pipeline.repository'
import { DrizzlePipelineStageRepository } from '../../infrastructure/drizzle-pipeline-stage.repository'
import { DrizzleDealRepository } from '../../infrastructure/drizzle-deal.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [PipelinesController, PipelinesGrpcController],
  providers: [
    CreatePipelineHandler,
    UpdatePipelineHandler,
    DeletePipelineHandler,
    CreateStageHandler,
    ReorderStagesHandler,
    CreateDealHandler,
    UpdateDealHandler,
    MoveDealHandler,
    WinDealHandler,
    LoseDealHandler,
    DeleteDealHandler,
    GetPipelineHandler,
    ListPipelinesHandler,
    GetPipelineBoardHandler,
    ListDealsHandler,
    GetDealHandler,
    OutboxService,
    { provide: PipelineRepository, useClass: DrizzlePipelineRepository },
    { provide: PipelineStageRepository, useClass: DrizzlePipelineStageRepository },
    { provide: DealRepository, useClass: DrizzleDealRepository },
  ],
  exports: [PipelineRepository, PipelineStageRepository, DealRepository],
})
export class PipelinesModule {}
