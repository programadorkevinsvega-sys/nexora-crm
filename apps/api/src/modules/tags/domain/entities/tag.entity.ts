export interface TagProps {
  id: string
  tenantId: string
  name: string
  color: string | null
  createdAt: Date
}

export class Tag {
  private constructor(private readonly props: TagProps) {}

  static create(props: TagProps): Tag {
    return new Tag(props)
  }

  get id(): string { return this.props.id }
  get tenantId(): string { return this.props.tenantId }
  get name(): string { return this.props.name }
  get color(): string | null { return this.props.color }
  get createdAt(): Date { return this.props.createdAt }

  toJSON() {
    return { ...this.props }
  }
}
