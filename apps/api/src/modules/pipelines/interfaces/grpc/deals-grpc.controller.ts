import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateDealHandler, UpdateDealHandler, MoveDealHandler, WinDealHandler, LoseDealHandler, DeleteDealHandler,
} from '../../application/commands/pipeline.handlers'
import {
  ListDealsHandler, GetDealHandler,
} from '../../application/queries/pipeline.handlers'
import {
  CreateDealCommand, UpdateDealCommand, MoveDealCommand, WinDealCommand, LoseDealCommand, DeleteDealCommand,
} from '../../application/commands/pipeline.commands'
import {
  ListDealsQuery, GetDealQuery,
} from '../../application/queries/pipeline.queries'
import { PipelineMapper } from '../../infrastructure/pipeline.mapper'
import { DealStatus } from '../../domain/entities/deal.entity'

@Controller()
export class DealsGrpcController {
  constructor(
    private readonly createDealHandler: CreateDealHandler,
    private readonly updateDealHandler: UpdateDealHandler,
    private readonly moveDealHandler: MoveDealHandler,
    private readonly winDealHandler: WinDealHandler,
    private readonly loseDealHandler: LoseDealHandler,
    private readonly deleteDealHandler: DeleteDealHandler,
    private readonly listDealsHandler: ListDealsHandler,
    private readonly getDealHandler: GetDealHandler,
  ) {}

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
    requestingUserId?: string
    requesting_user_id?: string
    userId?: string
    user_id?: string
    requestingUserRole?: string
    requesting_user_role?: string
    userRole?: string
    user_role?: string
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
        requestingUserId: data.requestingUserId || data.requesting_user_id || data.userId || data.user_id,
        requestingUserRole: data.requestingUserRole || data.requesting_user_role || data.userRole || data.user_role,
        search: data.search,
      }),
    )

    return {
      jsonItems: deals.map((deal) => JSON.stringify(PipelineMapper.toDealResponse(deal))),
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
