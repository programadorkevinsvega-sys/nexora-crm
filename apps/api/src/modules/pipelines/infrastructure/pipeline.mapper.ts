import { Pipeline } from '../domain/entities/pipeline.entity'
import { PipelineStage } from '../domain/entities/pipeline-stage.entity'
import { Deal } from '../domain/entities/deal.entity'

type PipelineRow = {
  id: string
  tenantId: string
  name: string
  createdAt: Date
}

type PipelineStageRow = {
  id: string
  tenantId: string
  pipelineId: string
  name: string
  probabilityPercent: number | null
  displayOrder: number
  createdAt: Date
}

type DealRow = {
  id: string
  tenantId: string
  pipelineId: string
  stageId: string
  contactId: string | null
  companyId: string | null
  name: string
  amount: string | null
  expectedCloseDate: string | null
  status: string | null
  assignedUserId: string | null
  lostReasonId: string | null
  lostNotes: string | null
  createdAt: Date
  updatedAt: Date
}

export class PipelineMapper {
  static toDomain(row: PipelineRow): Pipeline {
    return new Pipeline(row.id, row.tenantId, row.name, row.createdAt)
  }

  static toPersistence(pipeline: Pipeline): PipelineRow {
    return {
      id: pipeline.id,
      tenantId: pipeline.tenantId,
      name: pipeline.name,
      createdAt: pipeline.createdAt,
    }
  }

  static toResponse(pipeline: Pipeline) {
    return {
      id: pipeline.id,
      name: pipeline.name,
      createdAt: pipeline.createdAt.toISOString(),
    }
  }

  static stageToDomain(row: PipelineStageRow): PipelineStage {
    return new PipelineStage(
      row.id,
      row.tenantId,
      row.pipelineId,
      row.name,
      row.probabilityPercent ?? 0,
      row.displayOrder,
      row.createdAt,
    )
  }

  static stageToPersistence(stage: PipelineStage): PipelineStageRow {
    return {
      id: stage.id,
      tenantId: stage.tenantId,
      pipelineId: stage.pipelineId,
      name: stage.name,
      probabilityPercent: stage.probabilityPercent,
      displayOrder: stage.displayOrder,
      createdAt: stage.createdAt,
    }
  }

  static toStageResponse(stage: PipelineStage) {
    return {
      id: stage.id,
      pipelineId: stage.pipelineId,
      name: stage.name,
      probabilityPercent: stage.probabilityPercent,
      displayOrder: stage.displayOrder,
      createdAt: stage.createdAt.toISOString(),
    }
  }

  static dealToDomain(row: DealRow): Deal {
    return new Deal(
      row.id,
      row.tenantId,
      row.pipelineId,
      row.stageId,
      row.contactId,
      row.companyId,
      row.name,
      row.amount ? Number(row.amount) : 0,
      row.expectedCloseDate,
      (row.status as Deal['status']) ?? 'OPEN',
      row.assignedUserId,
      row.lostReasonId,
      row.lostNotes,
      row.createdAt,
      row.updatedAt,
    )
  }

  static dealToPersistence(deal: Deal): DealRow {
    return {
      id: deal.id,
      tenantId: deal.tenantId,
      pipelineId: deal.pipelineId,
      stageId: deal.stageId,
      contactId: deal.contactId,
      companyId: deal.companyId,
      name: deal.name,
      amount: deal.amount.toString(),
      expectedCloseDate: deal.expectedCloseDate,
      status: deal.status,
      assignedUserId: deal.assignedUserId,
      lostReasonId: deal.lostReasonId,
      lostNotes: deal.lostNotes,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    }
  }

  static toDealResponse(deal: Deal) {
    return {
      id: deal.id,
      pipelineId: deal.pipelineId,
      stageId: deal.stageId,
      contactId: deal.contactId,
      companyId: deal.companyId,
      name: deal.name,
      amount: deal.amount,
      expectedCloseDate: deal.expectedCloseDate,
      status: deal.status,
      assignedUserId: deal.assignedUserId,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    }
  }
}
