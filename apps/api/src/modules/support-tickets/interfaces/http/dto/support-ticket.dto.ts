import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean } from 'class-validator'

export enum TicketStatusEnum {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AuthorTypeEnum {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
}

export class CreateTicketDto {
  @IsString()
  subject!: string

  @IsString()
  description!: string

  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsEnum(TicketPriorityEnum)
  priority?: TicketPriorityEnum

  @IsOptional()
  @IsUUID()
  assignedUserId?: string

  @IsOptional()
  @IsUUID()
  slaId?: string
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatusEnum)
  status!: TicketStatusEnum
}

export class AssignTicketDto {
  @IsUUID()
  assignedUserId!: string
}

export class AddReplyDto {
  @IsEnum(AuthorTypeEnum)
  authorType!: AuthorTypeEnum

  @IsUUID()
  authorId!: string

  @IsString()
  message!: string

  @IsOptional()
  @IsBoolean()
  isInternalNote?: boolean
}

export class TicketResponse {
  id!: string
  contactId!: string | null
  subject!: string
  description!: string
  status!: string
  priority!: string
  assignedUserId!: string | null
  slaId!: string | null
  firstResponseAt!: string | null
  slaBreachAt!: string | null
  isEscalated!: boolean
  createdAt!: string
  updatedAt!: string
}

export class ReplyResponse {
  id!: string
  ticketId!: string
  authorType!: string
  authorId!: string
  message!: string
  isInternalNote!: boolean
  createdAt!: string
}

export class TicketWithRepliesResponse {
  ticket!: TicketResponse
  replies!: ReplyResponse[]
}
