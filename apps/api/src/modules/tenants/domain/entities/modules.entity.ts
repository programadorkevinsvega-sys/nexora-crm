export class SystemModule {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string,
    readonly description: string | null,
    readonly iconSvg: string | null,
    readonly category: string | null,
    readonly isCore: boolean,
    readonly isActive: boolean,
    readonly version: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    name: string
    slug: string
    description?: string
    iconSvg?: string
    category?: string
    isCore?: boolean
    version?: string
  }): SystemModule {
    return new SystemModule(
      crypto.randomUUID(),
      props.name, props.slug,
      props.description ?? null,
      props.iconSvg ?? null,
      props.category ?? null,
      props.isCore ?? false,
      true,
      props.version ?? '1.0.0',
      new Date(), new Date(),
    )
  }
}

export class InstalledModule {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly moduleId: string,
    readonly status: string,
    readonly installedAt: Date,
    readonly configurationJson: Record<string, unknown> | null,
  ) {}

  static create(props: {
    tenantId: string
    moduleId: string
    configuration?: Record<string, unknown>
  }): InstalledModule {
    return new InstalledModule(
      crypto.randomUUID(),
      props.tenantId, props.moduleId,
      'ACTIVE', new Date(),
      props.configuration ?? null,
    )
  }
}
