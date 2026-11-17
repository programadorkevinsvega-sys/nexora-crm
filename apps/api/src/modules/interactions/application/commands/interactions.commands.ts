export class CreateNoteCommand {
  constructor(
    readonly tenantId: string,
    readonly content: string,
    readonly authorUserId: string,
    readonly contactId?: string,
    readonly companyId?: string,
    readonly dealId?: string,
  ) {}
}

export class UpdateNoteCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly content?: string,
    readonly contactId?: string | null,
    readonly companyId?: string | null,
    readonly dealId?: string | null,
  ) {}
}

export class DeleteNoteCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class CreateTaskCommand {
  constructor(
    readonly tenantId: string,
    readonly title: string,
    readonly dueDate: Date,
    readonly assignedUserId: string,
    readonly contactId?: string,
    readonly companyId?: string,
    readonly dealId?: string,
    readonly description?: string,
    readonly isCompleted?: boolean,
  ) {}
}

export class UpdateTaskCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly title?: string,
    readonly description?: string | null,
    readonly dueDate?: Date,
    readonly isCompleted?: boolean,
    readonly contactId?: string | null,
    readonly companyId?: string | null,
    readonly dealId?: string | null,
    readonly assignedUserId?: string,
  ) {}
}

export class DeleteTaskCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class CreateCallCommand {
  constructor(
    readonly tenantId: string,
    readonly callType: 'INBOUND' | 'OUTBOUND' | 'MEETING',
    readonly happenedAt: Date,
    readonly authorUserId: string,
    readonly contactId?: string,
    readonly durationSeconds?: number,
    readonly summary?: string,
  ) {}
}
