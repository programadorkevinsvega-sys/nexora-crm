import { Entity } from "../common/entities/base.entity"

export interface TagProps {
  tenantId: string
  name: string
  color: string
}

export class Tag extends Entity<TagProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get name(): string {
    return this.props.name
  }

  get color(): string {
    return this.props.color
  }

  static create(
    props: TagCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Tag {
    return new Tag(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      color: props.color ?? "#E2E8F0",
    })
  }

  update(input: TagUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.color !== undefined) {
      this.props.color = input.color
    }
    this.touch()
  }
}

export interface TagCreateInput {
  tenantId: string
  name: string
  color?: string
}

export interface TagUpdateInput {
  name?: string
  color?: string
}
