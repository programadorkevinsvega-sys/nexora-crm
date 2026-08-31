export class CreatePipelineCommand {
  constructor(readonly tenantId: string, readonly name: string) {}
}

export class UpdatePipelineCommand {
  constructor(readonly tenantId: string, readonly id: string, readonly name?: string) {}
}

export class DeletePipelineCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class CreateStageCommand {
  constructor(
    readonly tenantId: string,
    readonly pipelineId: string,
    readonly name: string,
    readonly probabilityPercent?: number,
    readonly displayOrder?: number,
  ) {}
}

export class ReorderStagesCommand {
  constructor(readonly tenantId: string, readonly pipelineId: string, readonly stageIds: string[]) {}
}

export class CreateDealCommand {
  constructor(
    readonly tenantId: string,
    readonly pipelineId: string,
    readonly stageId: string,
    readonly name: string,
    readonly contactId?: string,
    readonly companyId?: string,
    readonly amount?: number,
    readonly expectedCloseDate?: string,
    readonly assignedUserId?: string,
  ) {}
}

export class UpdateDealCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly name?: string,
    readonly stageId?: string,
    readonly contactId?: string,
    readonly companyId?: string,
    readonly amount?: number,
    readonly expectedCloseDate?: string,
    readonly assignedUserId?: string,
  ) {}
}

export class MoveDealCommand {
  constructor(readonly tenantId: string, readonly id: string, readonly stageId: string) {}
}

export class WinDealCommand {
  constructor(readonly tenantId: string, readonly id: string, readonly amount?: number) {}
}

export class LoseDealCommand {
  constructor(readonly tenantId: string, readonly id: string, readonly reasonId?: string, readonly notes?: string) {}
}

export class DeleteDealCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}
