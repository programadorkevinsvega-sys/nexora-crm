export class Permission {
  constructor(
    readonly id: string,
    readonly module: string,
    readonly action: string,
    readonly description: string | null,
  ) {}

  static create(props: {
    module: string
    action: string
    description?: string
  }): Permission {
    return new Permission(
      crypto.randomUUID(),
      props.module,
      props.action,
      props.description ?? null,
    )
  }
}
