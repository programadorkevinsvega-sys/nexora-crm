export class CreateTagCommand {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly color?: string,
  ) {}
}

export class UpdateTagCommand {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
    public readonly name?: string,
    public readonly color?: string,
  ) {}
}

export class DeleteTagCommand {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
  ) {}
}
