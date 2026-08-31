export class CreateConversationCommand {
  constructor(
    readonly tenantId: string,
    readonly mailboxId: string,
    readonly subject: string,
    readonly customerEmail: string,
    readonly customerId?: string,
    readonly assigneeUserId?: string,
    readonly status?: string,
    readonly priority?: string,
    readonly sourceChannel?: string,
    readonly previewText?: string,
    readonly estimatedHours?: number,
    readonly dueDate?: Date,
    readonly isInternal?: boolean,
    readonly requiresApproval?: boolean,
  ) {}
}

export class AssignConversationCommand {
  constructor(
    readonly tenantId: string,
    readonly conversationId: string,
    readonly assigneeUserId: string,
  ) {}
}

export class ChangeConversationStatusCommand {
  constructor(
    readonly tenantId: string,
    readonly conversationId: string,
    readonly status: string,
  ) {}
}

export class ResolveConversationCommand {
  constructor(
    readonly tenantId: string,
    readonly conversationId: string,
    readonly resolvedByUserId: string | null,
  ) {}
}

export class AddThreadCommand {
  constructor(
    readonly tenantId: string,
    readonly conversationId: string,
    readonly threadType: string,
    readonly bodyHtml?: string,
    readonly bodyText?: string,
    readonly createdByUserId?: string,
    readonly createdByCustomerId?: string,
    readonly isDraft?: boolean,
    readonly messageIdHeader?: string,
    readonly toAddresses?: string,
    readonly ccAddresses?: string,
  ) {}
}

export class UpdateAgentAvailabilityCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly isAvailable: boolean,
    readonly agentStatus?: string,
  ) {}
}

export class CreateMailboxCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly emailAddress: string,
    readonly isActive?: boolean,
  ) {}
}
