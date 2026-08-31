import { IsString, IsOptional, IsNumber, IsUUID, IsBoolean, IsInt } from 'class-validator'

export class CreateProgramDto {
  @IsString()
  name!: string

  @IsString()
  commissionType!: string

  @IsNumber()
  commissionValue!: number

  @IsOptional()
  @IsInt()
  cookieDurationDays?: number

  @IsOptional()
  @IsBoolean()
  isMultiLevel?: boolean

  @IsOptional()
  @IsInt()
  maxMlmLevels?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  commissionType?: string

  @IsOptional()
  @IsNumber()
  commissionValue?: number

  @IsOptional()
  @IsInt()
  cookieDurationDays?: number

  @IsOptional()
  @IsBoolean()
  isMultiLevel?: boolean

  @IsOptional()
  @IsInt()
  maxMlmLevels?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class RegisterAffiliateDto {
  @IsUUID()
  programId!: string

  @IsUUID()
  customerId!: string

  @IsString()
  referralCode!: string

  @IsString()
  referralLink!: string

  @IsOptional()
  @IsUUID()
  parentAffiliateId?: string

  @IsOptional()
  @IsInt()
  mlmLevel?: number

  @IsOptional()
  @IsString()
  status?: string
}

export class RecordCommissionDto {
  @IsUUID()
  sourceOrderId!: string

  @IsNumber()
  commissionAmount!: number

  @IsOptional()
  @IsInt()
  mlmLevelEarned?: number

  @IsOptional()
  @IsString()
  status?: string
}

export class ProcessPayoutDto {
  @IsNumber()
  amount!: number

  @IsOptional()
  @IsString()
  paymentMethod?: string

  @IsOptional()
  @IsString()
  paymentReference?: string

  @IsOptional()
  @IsString()
  status?: string
}
