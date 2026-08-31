import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator'

export class CreateContractDto {
  @IsUUID()
  companyId!: string

  @IsOptional()
  @IsUUID()
  dealId?: string

  @IsString()
  name!: string

  @IsString()
  startDate!: string

  @IsOptional()
  @IsString()
  endDate?: string

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean

  @IsOptional()
  @IsNumber()
  mrrValue?: number

  @IsUUID()
  ownerUserId!: string
}

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  startDate?: string

  @IsOptional()
  @IsString()
  endDate?: string

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean

  @IsOptional()
  @IsNumber()
  mrrValue?: number

  @IsOptional()
  @IsString()
  status?: string
}

export class UpdateContractStatusDto {
  @IsString()
  status!: string
}

export class ContractResponse {
  id!: string
  companyId!: string
  dealId!: string | null
  name!: string
  startDate!: string
  endDate!: string | null
  autoRenew!: boolean
  mrrValue!: number
  status!: string
  ownerUserId!: string
  createdAt!: string
  updatedAt!: string
}
