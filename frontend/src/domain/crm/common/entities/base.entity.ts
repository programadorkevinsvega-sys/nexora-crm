export abstract class Entity<TProps = unknown> {
  protected readonly _id: string
  protected readonly _createdAt: Date
  protected _updatedAt: Date
  protected readonly props: TProps

  constructor(id: string, createdAt: Date | string, updatedAt: Date | string, props: TProps) {
    this._id = id
    this._createdAt = typeof createdAt === "string" ? new Date(createdAt) : createdAt
    this._updatedAt = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt
    this.props = props
  }

  get id(): string { return this._id }
  get createdAt(): Date { return this._createdAt }
  get updatedAt(): Date { return this._updatedAt }

  protected touch(): void {
    this._updatedAt = new Date()
  }

  equals(other: Entity): boolean {
    return this._id === other._id
  }
}

export type EntityData = {
  id: string
  createdAt: string
  updatedAt: string
}
