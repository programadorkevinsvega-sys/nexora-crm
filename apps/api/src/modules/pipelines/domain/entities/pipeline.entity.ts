export class Pipeline {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly createdAt: Date,
  ) {}

  static create(props: { tenantId: string; name: string }): Pipeline {
    return new Pipeline(crypto.randomUUID(), props.tenantId, props.name, new Date())
  }

  update(props: Partial<Pick<Pipeline, 'name'>>): Pipeline {
    return new Pipeline(this.id, this.tenantId, props.name ?? this.name, this.createdAt)
  }
}
