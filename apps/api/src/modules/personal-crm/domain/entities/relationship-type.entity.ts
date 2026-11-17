export class RelationshipType {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly reverseName: string,
    readonly createdAt: Date,
  ) {}

  static create(props: { tenantId: string; name: string; reverseName: string }): RelationshipType {
    return new RelationshipType(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.reverseName,
      new Date(),
    )
  }
}
