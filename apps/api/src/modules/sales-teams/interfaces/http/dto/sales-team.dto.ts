import { IsString, IsOptional, IsNumber, IsUUID, Min, Max, IsInt } from 'class-validator'

export class CreateTeamDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsUUID()
  managerUserId?: string

  @IsOptional()
  @IsNumber()
  monthlyTarget?: number
}

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsUUID()
  managerUserId?: string

  @IsOptional()
  @IsNumber()
  monthlyTarget?: number
}

export class AddMemberDto {
  @IsUUID()
  userId!: string
}

export class SetQuotaDto {
  @IsUUID()
  userId!: string

  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth!: number

  @IsInt()
  periodYear!: number

  @IsNumber()
  targetAmount!: number
}

export class UpdateAchievedDto {
  @IsNumber()
  achievedAmount!: number
}

export class SalesTeamResponse {
  id!: string
  name!: string
  managerUserId!: string | null
  monthlyTarget!: number | null
  createdAt!: string
  updatedAt!: string
}

export class SalesTeamMemberResponse {
  teamId!: string
  userId!: string
}

export class SalesQuotaResponse {
  id!: string
  userId!: string
  teamId!: string | null
  periodMonth!: number
  periodYear!: number
  targetAmount!: number
  achievedAmount!: number
  createdAt!: string
}
