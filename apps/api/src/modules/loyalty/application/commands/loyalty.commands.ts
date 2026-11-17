export class EarnPointsCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly points: number,
  ) {}
}

export class RedeemPointsCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly points: number,
  ) {}
}

export class CreateSegmentCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly description?: string,
    readonly isDynamic?: boolean,
    readonly rulesJson?: Record<string, unknown>,
  ) {}
}

export class AssignToSegmentCommand {
  constructor(
    readonly tenantId: string,
    readonly segmentId: string,
    readonly contactId: string,
  ) {}
}
