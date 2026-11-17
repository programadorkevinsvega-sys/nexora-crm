import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsIn, IsDateString } from 'class-validator'

export class CreateLifeEventDto {
  @IsUUID()
  contactId!: string

  @IsString()
  eventType!: string

  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsDateString()
  happenedAt?: string

  @IsOptional()
  @IsBoolean()
  isYearlyRecurring?: boolean
}

export class CreateGiftDto {
  @IsUUID()
  contactId!: string

  @IsOptional()
  @IsIn(['GIVEN', 'RECEIVED'])
  direction?: 'GIVEN' | 'RECEIVED'

  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  url?: string

  @IsOptional()
  @IsNumber()
  estimatedValue?: number

  @IsOptional()
  @IsIn(['IDEA', 'PURCHASED', 'GIVEN', 'RECEIVED'])
  status?: 'IDEA' | 'PURCHASED' | 'GIVEN' | 'RECEIVED'

  @IsOptional()
  @IsDateString()
  dateGivenOrReceived?: string
}

export class CreateDebtDto {
  @IsUUID()
  contactId!: string

  @IsIn(['OWES_ME', 'I_OWE'])
  direction!: 'OWES_ME' | 'I_OWE'

  @IsNumber()
  amount!: number

  @IsString()
  reason!: string

  @IsOptional()
  @IsIn(['UNPAID', 'PAID', 'FORGIVEN'])
  status?: 'UNPAID' | 'PAID' | 'FORGIVEN'

  @IsOptional()
  @IsDateString()
  dueDate?: string
}

export class CreateReminderDto {
  @IsUUID()
  contactId!: string

  @IsString()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'])
  frequencyType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'

  @IsOptional()
  @IsNumber()
  frequencyInterval?: number

  @IsOptional()
  @IsDateString()
  nextDueDate?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class AddPetDto {
  @IsUUID()
  contactId!: string

  @IsString()
  petCategory!: string

  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  breed?: string
}
