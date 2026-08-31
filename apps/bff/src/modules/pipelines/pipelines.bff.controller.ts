import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import {
  CreatePipelineSchema,
  CreateStageSchema,
  ReorderStagesSchema,
  CreateDealSchema,
  UpdateDealSchema,
  MoveDealSchema,
  WinDealSchema,
  LoseDealSchema,
  DealFilterSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { PipelinesBffService, PaginatedResult } from './pipelines.bff.service'
import type {
  Pipeline, CreatePipeline, PipelineBoard,
  PipelineStage, CreateStage, ReorderStages,
  Deal, CreateDeal, UpdateDeal, DealFilter,
} from '@crm/contracts'

@Controller('api/pipelines')
export class PipelinesBffController {
  constructor(private readonly service: PipelinesBffService) {}

  @Get('deals')
  async listDeals(
    @Query() raw: Record<string, string>,
    @Headers('X-Tenant-Id') tenantId?: string,
    @Headers('X-User-Id') userId?: string,
    @Headers('X-User-Role') userRole?: string,
  ): Promise<PaginatedResult<Deal>> {
    const filters: any = DealFilterSchema.parse(raw)
    filters.requestingUserId = userId
    filters.requestingUserRole = userRole
    return this.service.listDeals(filters, tenantId!)
  }

  @Post('deals')
  async createDeal(
    @Body(createZodPipe(CreateDealSchema)) dto: CreateDeal,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.createDeal(dto, tenantId!)
  }

  @Get('deals/:dealId')
  async getDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.getDeal(dealId, tenantId!)
  }

  @Put('deals/:dealId')
  async updateDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body(createZodPipe(UpdateDealSchema)) dto: UpdateDeal,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.updateDeal(dealId, dto, tenantId!)
  }

  @Put('deals/:dealId/move')
  async moveDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body(createZodPipe(MoveDealSchema)) dto: { stageId: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.moveDeal(dealId, dto.stageId, tenantId!)
  }

  @Put('deals/:dealId/win')
  async winDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body(createZodPipe(WinDealSchema)) dto: { amount?: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.winDeal(dealId, dto.amount, tenantId!)
  }

  @Put('deals/:dealId/lose')
  async loseDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body(createZodPipe(LoseDealSchema)) dto: { lostReasonId?: string; lostNotes?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Deal> {
    return this.service.loseDeal(dealId, dto.lostReasonId, dto.lostNotes, tenantId!)
  }

  @Delete('deals/:dealId')
  async deleteDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.deleteDeal(dealId, tenantId!)
  }

  @Get()
  async listPipelines(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Pipeline[]> {
    return this.service.listPipelines(tenantId!)
  }

  @Post()
  async createPipeline(
    @Body(createZodPipe(CreatePipelineSchema)) dto: CreatePipeline,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Pipeline> {
    return this.service.createPipeline(dto, tenantId!)
  }

  @Get(':id')
  async getPipelineBoard(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PipelineBoard> {
    return this.service.getPipelineBoard(id, tenantId!)
  }

  @Put(':id')
  async updatePipeline(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreatePipeline>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Pipeline> {
    return this.service.updatePipeline(id, dto, tenantId!)
  }

  @Delete(':id')
  async deletePipeline(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.deletePipeline(id, tenantId!)
  }

  @Post(':pipelineId/stages')
  async createStage(
    @Param('pipelineId', ParseUUIDPipe) pipelineId: string,
    @Body(createZodPipe(CreateStageSchema)) dto: CreateStage,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PipelineStage> {
    return this.service.createStage(pipelineId, dto, tenantId!)
  }

  @Put(':pipelineId/stages/reorder')
  async reorderStages(
    @Param('pipelineId', ParseUUIDPipe) pipelineId: string,
    @Body(createZodPipe(ReorderStagesSchema)) dto: ReorderStages,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PipelineStage[]> {
    return this.service.reorderStages(pipelineId, dto, tenantId!)
  }
}
