import { Entity } from "../common/entities/base.entity"

export interface CustomerSegmentProps {
  tenantId: string
  name: string
  description: string | null
  isDynamic: boolean
  rulesJson: unknown
}

export class CustomerSegment extends Entity<CustomerSegmentProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get name(): string {
    return this.props.name
  }

  get description(): string | null {
    return this.props.description
  }

  get isDynamic(): boolean {
    return this.props.isDynamic
  }

  get rulesJson(): unknown {
    return this.props.rulesJson
  }

  static create(
    props: SegmentCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): CustomerSegment {
    return new CustomerSegment(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      description: props.description ?? null,
      isDynamic: props.isDynamic ?? false,
      rulesJson: props.rulesJson ?? null,
    })
  }
}

export interface SegmentCreateInput {
  tenantId: string
  name: string
  description?: string | null
  isDynamic?: boolean
  rulesJson?: unknown
}
