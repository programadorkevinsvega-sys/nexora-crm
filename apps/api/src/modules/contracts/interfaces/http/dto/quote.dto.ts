import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator'

export class CreateQuoteDto {
  @IsUUID()
  dealId!: string

  @IsString()
  quoteNumber!: string

  @IsString()
  validUntil!: string

  @IsOptional()
  @IsString()
  termsAndConditions?: string

  @IsOptional()
  @IsNumber()
  subtotal?: number

  @IsOptional()
  @IsNumber()
  taxTotal?: number

  @IsOptional()
  @IsNumber()
  grandTotal?: number
}

export class RejectQuoteDto {
  @IsString()
  reason!: string
}

export class QuoteResponse {
  id!: string
  dealId!: string
  quoteNumber!: string
  status!: string
  validUntil!: string
  termsAndConditions!: string | null
  subtotal!: number
  taxTotal!: number
  grandTotal!: number
  createdAt!: string
  updatedAt!: string
}
