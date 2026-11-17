import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, Min } from 'class-validator'

export class EarnPointsDto {
  @IsNumber()
  @Min(1)
  points!: number
}

export class RedeemPointsDto {
  @IsNumber()
  @Min(1)
  points!: number
}

export class CreateSegmentDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsBoolean()
  isDynamic?: boolean

  @IsOptional()
  rulesJson?: Record<string, unknown>
}

export class AssignToSegmentDto {
  @IsUUID()
  contactId!: string
}
