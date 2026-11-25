import { IsString, IsOptional, IsUUID, IsBoolean, IsNumber } from 'class-validator'

export class CreateConversationDto {
  @IsUUID()
  mailboxId!: string

  @IsString()
  subject!: string

  @IsString()
  customerEmail!: string

  @IsOptional()
  @IsUUID()
  customerId?: string

  @IsOptional()
  @IsUUID()
  assigneeUserId?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  priority?: string

  @IsOptional()
  @IsString()
  sourceChannel?: string

  @IsOptional()
  @IsString()
  previewText?: string

  @IsOptional()
  @IsNumber()
  estimatedHours?: number

  @IsOptional()
  @IsString()
  dueDate?: string

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean
}

export class AssignConversationDto {
  @IsUUID()
  assigneeUserId!: string
}

export class ChangeConversationStatusDto {
  @IsString()
  status!: string
}

export class ResolveConversationDto {
  @IsOptional()
  @IsUUID()
  resolvedByUserId?: string
}

export class AddThreadDto {
  @IsString()
  threadType!: string

  @IsOptional()
  @IsString()
  bodyHtml?: string

  @IsOptional()
  @IsString()
  bodyText?: string

  @IsOptional()
  @IsUUID()
  createdByUserId?: string

  @IsOptional()
  @IsUUID()
  createdByCustomerId?: string

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean

  @IsOptional()
  @IsString()
  messageIdHeader?: string

  @IsOptional()
  @IsString()
  toAddresses?: string

  @IsOptional()
  @IsString()
  ccAddresses?: string
}

export class CreateMailboxDto {
  @IsString()
  name!: string

  @IsString()
  emailAddress!: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class ListConversationsQueryDto {
  @IsOptional()
  @IsUUID()
  mailboxId?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsUUID()
  assigneeUserId?: string

  @IsOptional()
  @IsString()
  priority?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  cursor?: string

  @IsOptional()
  @IsNumber()
  limit?: number
}

export class ConversationResponse {
  id!: string
  tenantId!: string
  mailboxId!: string
  ticketNumber!: number | null
  subject!: string
  customerEmail!: string
  customerId!: string | null
  assigneeUserId!: string | null
  status!: string
  priority!: string
  sourceChannel!: string
  previewText!: string | null
  hasAttachments!: boolean
  lastReplyAt!: string | null
  lastReplyFrom!: string | null
  closedAt!: string | null
  estimatedHours!: number | null
  workedHours!: number | null
  dueDate!: string | null
  firstResponseAt!: string | null
  resolvedAt!: string | null
  isInternal!: boolean
  requiresApproval!: boolean
  createdAt!: string
  updatedAt!: string
}

export class ThreadResponse {
  id!: string
  conversationId!: string
  threadType!: string
  bodyHtml!: string | null
  bodyText!: string | null
  createdByUserId!: string | null
  createdByCustomerId!: string | null
  isDraft!: boolean
  messageIdHeader!: string | null
  toAddresses!: string | null
  ccAddresses!: string | null
  createdAt!: string
  updatedAt!: string
}

export class MailboxResponse {
  id!: string
  name!: string
  emailAddress!: string
  isActive!: boolean
  createdAt!: string
  updatedAt!: string
}

export class AgentProfileResponse {
  id!: string
  userId!: string
  isAvailable!: boolean
  agentStatus!: string
  activeTicketsCount!: number
  resolvedTicketsCount!: number
  createdAt!: string
  updatedAt!: string
}
