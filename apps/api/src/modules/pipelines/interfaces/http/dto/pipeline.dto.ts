import { IsString, IsOptional, IsNumber, IsUUID, IsArray, IsEnum } from 'class-validator'

export class CreatePipelineDto {
  @IsString()
  name!: string
}

export class UpdatePipelineDto {
  @IsOptional()
  @IsString()
  name?: string
}

export class CreateStageDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsNumber()
  probabilityPercent?: number

  @IsOptional()
  @IsNumber()
  displayOrder?: number
}

export class ReorderStagesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  stageIds!: string[]
}

export class CreateDealDto {
  @IsUUID()
  pipelineId!: string

  @IsUUID()
  stageId!: string

  @IsString()
  name!: string

  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsNumber()
  amount?: number

  @IsOptional()
  @IsString()
  expectedCloseDate?: string

  @IsOptional()
  @IsUUID()
  assignedUserId?: string
}

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsUUID()
  stageId?: string

  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsNumber()
  amount?: number

  @IsOptional()
  @IsString()
  expectedCloseDate?: string

  @IsOptional()
  @IsUUID()
  assignedUserId?: string
}

export class MoveDealDto {
  @IsUUID()
  stageId!: string
}

export class WinDealDto {
  @IsOptional()
  @IsNumber()
  amount?: number
}

export class LoseDealDto {
  @IsOptional()
  @IsUUID()
  reasonId?: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class PipelineResponse {
  id!: string
  name!: string
  createdAt!: string
}

export class PipelineStageResponse {
  id!: string
  pipelineId!: string
  name!: string
  probabilityPercent!: number
  displayOrder!: number
  createdAt!: string
}

export class DealResponse {
  id!: string
  pipelineId!: string
  stageId!: string
  contactId!: string | null
  companyId!: string | null
  name!: string
  amount!: number
  expectedCloseDate!: string | null
  status!: string
  assignedUserId!: string | null
  createdAt!: string
  updatedAt!: string
}
