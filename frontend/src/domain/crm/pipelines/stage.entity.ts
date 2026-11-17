import { Entity } from "../common/entities/base.entity"

export interface StageProps {
  pipelineId: string
  name: string
  order: number
  color: string | null
  probability: number | null
}

export class Stage extends Entity<StageProps> {
  get pipelineId(): string {
    return this.props.pipelineId
  }

  get name(): string {
    return this.props.name
  }

  get order(): number {
    return this.props.order
  }

  get color(): string | null {
    return this.props.color
  }

  get probability(): number | null {
    return this.props.probability
  }

  static create(
    props: StageCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Stage {
    return new Stage(id, createdAt, updatedAt, {
      pipelineId: props.pipelineId,
      name: props.name,
      order: props.order,
      color: props.color ?? null,
      probability: props.probability ?? null,
    })
  }

  update(input: StageUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.order !== undefined) {
      this.props.order = input.order
    }
    if (input.color !== undefined) {
      this.props.color = input.color
    }
    if (input.probability !== undefined) {
      this.props.probability = input.probability
    }
    this.touch()
  }
}

export interface StageCreateInput {
  pipelineId: string
  name: string
  order: number
  color?: string | null
  probability?: number | null
}

export interface StageUpdateInput {
  name?: string
  order?: number
  color?: string | null
  probability?: number | null
}
