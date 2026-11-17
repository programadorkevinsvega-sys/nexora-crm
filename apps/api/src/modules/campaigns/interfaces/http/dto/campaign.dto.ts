import { IsString, IsOptional, IsNumber, IsUUID, IsIn, IsDateString } from 'class-validator'

const CAMPAIGN_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const
const MEMBER_STATUSES = ['SENT', 'OPENED', 'CLICKED', 'RESPONDED', 'BOUNCED', 'UNSUBSCRIBED'] as const

export class CreateCampaignDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsIn(CAMPAIGN_STATUSES)
  status?: (typeof CAMPAIGN_STATUSES)[number]

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsNumber()
  budgetedCost?: number

  @IsOptional()
  @IsNumber()
  actualCost?: number

  @IsOptional()
  @IsNumber()
  expectedRevenue?: number
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsNumber()
  budgetedCost?: number

  @IsOptional()
  @IsNumber()
  actualCost?: number

  @IsOptional()
  @IsNumber()
  expectedRevenue?: number
}

export class ChangeCampaignStatusDto {
  @IsIn(CAMPAIGN_STATUSES)
  status!: (typeof CAMPAIGN_STATUSES)[number]
}

export class AddMemberDto {
  @IsUUID()
  contactId!: string
}

export class UpdateMemberStatusDto {
  @IsIn(MEMBER_STATUSES)
  status!: (typeof MEMBER_STATUSES)[number]
}

export class CampaignResponse {
  id!: string
  name!: string
  type!: string | null
  status!: string
  startDate!: string | null
  endDate!: string | null
  budgetedCost!: number | null
  actualCost!: number | null
  expectedRevenue!: number | null
  createdAt!: string
  updatedAt!: string
}

export class CampaignMemberResponse {
  id!: string
  campaignId!: string
  contactId!: string
  status!: string
  respondedAt!: string | null
  createdAt!: string
}
