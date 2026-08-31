import { IsString, IsOptional, IsUUID, IsBoolean, IsDateString, IsEnum, IsNumber, IsPositive } from 'class-validator'

export class CreateNoteDto {
  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsUUID()
  dealId?: string

  @IsString()
  content!: string
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsUUID()
  contactId?: string | null

  @IsOptional()
  @IsUUID()
  companyId?: string | null

  @IsOptional()
  @IsUUID()
  dealId?: string | null
}

export class NoteResponse {
  id!: string
  contactId!: string | null
  companyId!: string | null
  dealId!: string | null
  content!: string
  authorUserId!: string
  createdAt!: string
  updatedAt!: string
}

export class CreateTaskDto {
  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsUUID()
  dealId?: string

  @IsString()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsDateString()
  dueDate!: string

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean

  @IsUUID()
  assignedUserId!: string
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean

  @IsOptional()
  @IsUUID()
  contactId?: string | null

  @IsOptional()
  @IsUUID()
  companyId?: string | null

  @IsOptional()
  @IsUUID()
  dealId?: string | null

  @IsOptional()
  @IsUUID()
  assignedUserId?: string
}

export class TaskResponse {
  id!: string
  contactId!: string | null
  companyId!: string | null
  dealId!: string | null
  title!: string
  description!: string | null
  dueDate!: string
  isCompleted!: boolean
  assignedUserId!: string
  createdAt!: string
  updatedAt!: string
}

export class CreateCallDto {
  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsEnum(['INBOUND', 'OUTBOUND', 'MEETING'])
  callType?: 'INBOUND' | 'OUTBOUND' | 'MEETING'

  @IsOptional()
  @IsNumber()
  @IsPositive()
  durationSeconds?: number

  @IsOptional()
  @IsString()
  summary?: string

  @IsDateString()
  happenedAt!: string
}

export class CallResponse {
  id!: string
  contactId!: string | null
  callType!: string
  durationSeconds!: number | null
  summary!: string | null
  happenedAt!: string
  authorUserId!: string
  createdAt!: string
}
