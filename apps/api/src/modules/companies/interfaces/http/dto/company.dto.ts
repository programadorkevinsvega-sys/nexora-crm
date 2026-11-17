import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator'

export class CreateCompanyDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  taxId?: string

  @IsOptional()
  @IsString()
  website?: string

  @IsOptional()
  @IsString()
  industry?: string

  @IsOptional()
  @IsNumber()
  numberOfEmployees?: number

  @IsOptional()
  @IsNumber()
  annualRevenue?: number

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  parentCompanyId?: string
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  taxId?: string

  @IsOptional()
  @IsString()
  website?: string

  @IsOptional()
  @IsString()
  industry?: string

  @IsOptional()
  @IsNumber()
  numberOfEmployees?: number

  @IsOptional()
  @IsNumber()
  annualRevenue?: number

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  parentCompanyId?: string
}

export class CompanyResponse {
  id!: string
  name!: string
  taxId!: string | null
  website!: string | null
  industry!: string | null
  numberOfEmployees!: number | null
  annualRevenue!: number | null
  description!: string | null
  parentCompanyId!: string | null
  createdAt!: string
  updatedAt!: string
}
