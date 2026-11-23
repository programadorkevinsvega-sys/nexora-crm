import { Entity } from "../common/entities/base.entity"

export interface PipelineProps {
  tenantId: string
  name: string
  description: string | null
}

export class Pipeline extends Entity<PipelineProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get name(): string {
    return this.props.name
  }

  get description(): string | null {
    return this.props.description
  }

  static create(
    props: PipelineCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Pipeline {
    return new Pipeline(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      description: props.description ?? null,
    })
  }

  update(input: PipelineUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.description !== undefined) {
      this.props.description = input.description
    }
    this.touch()
  }
}

export interface PipelineCreateInput {
  tenantId: string
  name: string
  description?: string | null
}

export interface PipelineUpdateInput {
  name?: string
  description?: string | null
}

export interface PipelineBoard {
  pipeline: {
    id: string
    name: string
  }
  stages: Array<{
    id: string
    name: string
    probabilityPercent: number | null
    displayOrder: number
    deals: Deal[]
  }>
}

interface Deal {
  id: string
  name: string
  value: number | null
  currency: string | null
  probability: number | null
  status: string
  contactId: string | null
  companyId: string | null
  ownerUserId: string | null
  closeDate: string | null
}
