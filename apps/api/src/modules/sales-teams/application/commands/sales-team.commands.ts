export class CreateTeamCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly managerUserId?: string,
    readonly monthlyTarget?: number,
  ) {}
}

export class UpdateTeamCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly name?: string,
    readonly managerUserId?: string,
    readonly monthlyTarget?: number,
  ) {}
}

export class DeleteTeamCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class AddMemberCommand {
  constructor(
    readonly tenantId: string,
    readonly teamId: string,
    readonly userId: string,
  ) {}
}

export class RemoveMemberCommand {
  constructor(
    readonly tenantId: string,
    readonly teamId: string,
    readonly userId: string,
  ) {}
}

export class SetQuotaCommand {
  constructor(
    readonly tenantId: string,
    readonly teamId: string,
    readonly userId: string,
    readonly periodMonth: number,
    readonly periodYear: number,
    readonly targetAmount: number,
  ) {}
}

export class UpdateAchievedCommand {
  constructor(
    readonly tenantId: string,
    readonly quotaId: string,
    readonly achievedAmount: number,
  ) {}
}
