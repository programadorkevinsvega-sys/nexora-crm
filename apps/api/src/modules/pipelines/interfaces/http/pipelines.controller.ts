import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
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
import {
  CreatePipelineDto, UpdatePipelineDto, CreateStageDto, ReorderStagesDto,
  CreateDealDto, UpdateDealDto, MoveDealDto, WinDealDto, LoseDealDto,
} from './dto/pipeline.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { PipelineMapper } from '../../infrastructure/pipeline.mapper'

@Controller('pipelines')
export class PipelinesController {
  constructor(
    private readonly createPipelineHandler: CreatePipelineHandler,
    private readonly updatePipelineHandler: UpdatePipelineHandler,
    private readonly deletePipelineHandler: DeletePipelineHandler,
    private readonly getPipelineHandler: GetPipelineHandler,
    private readonly listPipelinesHandler: ListPipelinesHandler,
    private readonly getPipelineBoardHandler: GetPipelineBoardHandler,
    private readonly createStageHandler: CreateStageHandler,
    private readonly reorderStagesHandler: ReorderStagesHandler,
    private readonly createDealHandler: CreateDealHandler,
    private readonly updateDealHandler: UpdateDealHandler,
    private readonly moveDealHandler: MoveDealHandler,
    private readonly winDealHandler: WinDealHandler,
    private readonly loseDealHandler: LoseDealHandler,
    private readonly deleteDealHandler: DeleteDealHandler,
    private readonly listDealsHandler: ListDealsHandler,
    private readonly getDealHandler: GetDealHandler,
  ) {}

  @Get()
  async list(@TenantId() tenantId: string) {
    const result = await this.listPipelinesHandler.execute(new ListPipelinesQuery(tenantId))
    return result.map(PipelineMapper.toResponse)
  }

  @Post()
  async create(@Body() dto: CreatePipelineDto, @TenantId() tenantId: string) {
    return this.createPipelineHandler.execute(new CreatePipelineCommand(tenantId, dto.name))
  }

  @Get(':id')
  async get(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.getPipelineBoardHandler.execute(new GetPipelineBoardQuery(tenantId, id))
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePipelineDto, @TenantId() tenantId: string) {
    await this.updatePipelineHandler.execute(new UpdatePipelineCommand(tenantId, id, dto.name))
    return { id }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.deletePipelineHandler.execute(new DeletePipelineCommand(tenantId, id))
    return { id }
  }

  @Post(':id/stages')
  async createStage(
    @Param('id') pipelineId: string,
    @Body() dto: CreateStageDto,
    @TenantId() tenantId: string,
  ) {
    return this.createStageHandler.execute(
      new CreateStageCommand(tenantId, pipelineId, dto.name, dto.probabilityPercent, dto.displayOrder),
    )
  }

  @Put(':id/stages/reorder')
  async reorderStages(
    @Param('id') pipelineId: string,
    @Body() dto: ReorderStagesDto,
    @TenantId() tenantId: string,
  ) {
    await this.reorderStagesHandler.execute(new ReorderStagesCommand(tenantId, pipelineId, dto.stageIds))
    return { id: pipelineId }
  }

  @Get('deals')
  async listDeals(
    @Query('pipelineId') pipelineId: string | undefined,
    @Query('stageId') stageId: string | undefined,
    @Query('status') status: string | undefined,
    @Query('contactId') contactId: string | undefined,
    @Query('companyId') companyId: string | undefined,
    @Query('assignedUserId') assignedUserId: string | undefined,
    @Query('search') search: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const deals = await this.listDealsHandler.execute(
      new ListDealsQuery(tenantId, { pipelineId, stageId, status, contactId, companyId, assignedUserId, search }),
    )
    return deals.map(PipelineMapper.toDealResponse)
  }

  @Post('deals')
  async createDeal(@Body() dto: CreateDealDto, @TenantId() tenantId: string) {
    return this.createDealHandler.execute(
      new CreateDealCommand(tenantId, dto.pipelineId, dto.stageId, dto.name, dto.contactId, dto.companyId, dto.amount, dto.expectedCloseDate, dto.assignedUserId),
    )
  }

  @Get('deals/:dealId')
  async getDeal(@Param('dealId') dealId: string, @TenantId() tenantId: string) {
    const deal = await this.getDealHandler.execute(new GetDealQuery(tenantId, dealId))
    return PipelineMapper.toDealResponse(deal)
  }

  @Put('deals/:dealId')
  async updateDeal(@Param('dealId') dealId: string, @Body() dto: UpdateDealDto, @TenantId() tenantId: string) {
    await this.updateDealHandler.execute(
      new UpdateDealCommand(tenantId, dealId, dto.name, dto.stageId, dto.contactId, dto.companyId, dto.amount, dto.expectedCloseDate, dto.assignedUserId),
    )
    return { id: dealId }
  }

  @Delete('deals/:dealId')
  async deleteDeal(@Param('dealId') dealId: string, @TenantId() tenantId: string) {
    await this.deleteDealHandler.execute(new DeleteDealCommand(tenantId, dealId))
    return { id: dealId }
  }

  @Put('deals/:dealId/move')
  async moveDeal(@Param('dealId') dealId: string, @Body() dto: MoveDealDto, @TenantId() tenantId: string) {
    await this.moveDealHandler.execute(new MoveDealCommand(tenantId, dealId, dto.stageId))
    return { id: dealId }
  }

  @Put('deals/:dealId/win')
  async winDeal(@Param('dealId') dealId: string, @Body() dto: WinDealDto, @TenantId() tenantId: string) {
    await this.winDealHandler.execute(new WinDealCommand(tenantId, dealId, dto.amount))
    return { id: dealId }
  }

  @Put('deals/:dealId/lose')
  async loseDeal(@Param('dealId') dealId: string, @Body() dto: LoseDealDto, @TenantId() tenantId: string) {
    await this.loseDealHandler.execute(new LoseDealCommand(tenantId, dealId, dto.reasonId, dto.notes))
    return { id: dealId }
  }
}
