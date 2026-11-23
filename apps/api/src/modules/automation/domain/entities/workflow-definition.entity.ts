import { WorkflowStatus, WorkflowStep } from '@crm/contracts'
import { cloneAndFreezeJson } from '../services/immutable-json'

export class WorkflowDefinition {
  readonly triggerFilter: Record<string, unknown> | null
  readonly stepsGraph: WorkflowStep[]

  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly description: string | null,
    readonly version: number,
    readonly status: WorkflowStatus,
    readonly triggerEvent: string,
    triggerFilter: Record<string, unknown> | null,
    stepsGraph: WorkflowStep[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {
    this.triggerFilter = cloneAndFreezeJson(triggerFilter)
    this.stepsGraph = cloneAndFreezeJson(stepsGraph)
  }

  static create(props: {
    tenantId: string
    name: string
    description?: string | null
    triggerEvent: string
    triggerFilter?: Record<string, unknown> | null
    stepsGraph: WorkflowStep[]
  }): WorkflowDefinition {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Workflow name is required')
    }
    if (!props.triggerEvent) {
      throw new Error('Workflow trigger event is required')
    }
    if (!props.stepsGraph || props.stepsGraph.length === 0) {
      throw new Error('Workflow must contain at least one step in stepsGraph')
    }

    return new WorkflowDefinition(
      crypto.randomUUID(),
      props.tenantId,
      props.name.trim(),
      props.description ?? null,
      1,
      'DRAFT',
      props.triggerEvent.trim(),
      props.triggerFilter ?? null,
      props.stepsGraph,
      new Date(),
      new Date(),
    )
  }

  activate(): WorkflowDefinition {
    if (this.status === 'ARCHIVED') {
      throw new Error('Archived workflow versions cannot be activated')
    }
    if (this.status === 'ACTIVE') return this

    return new WorkflowDefinition(
      this.id,
      this.tenantId,
      this.name,
      this.description,
      this.version,
      'ACTIVE',
      this.triggerEvent,
      this.triggerFilter,
      this.stepsGraph,
      this.createdAt,
      new Date(),
    )
  }

  pause(): WorkflowDefinition {
    if (this.status === 'PAUSED') return this
    if (this.status !== 'ACTIVE') {
      throw new Error('Only active workflow versions can be paused')
    }

    return new WorkflowDefinition(
      this.id,
      this.tenantId,
      this.name,
      this.description,
      this.version,
      'PAUSED',
      this.triggerEvent,
      this.triggerFilter,
      this.stepsGraph,
      this.createdAt,
      new Date(),
    )
  }

  archive(): WorkflowDefinition {
    if (this.status === 'ARCHIVED') return this

    return new WorkflowDefinition(
      this.id,
      this.tenantId,
      this.name,
      this.description,
      this.version,
      'ARCHIVED',
      this.triggerEvent,
      this.triggerFilter,
      this.stepsGraph,
      this.createdAt,
      new Date(),
    )
  }

  cloneAsNewVersion(overrides?: {
    name?: string
    description?: string | null
    triggerEvent?: string
    triggerFilter?: Record<string, unknown> | null
    stepsGraph?: WorkflowStep[]
  }): WorkflowDefinition {
    return new WorkflowDefinition(
      crypto.randomUUID(),
      this.tenantId,
      overrides?.name ?? this.name,
      overrides?.description !== undefined ? overrides.description : this.description,
      this.version + 1,
      'DRAFT',
      overrides?.triggerEvent ?? this.triggerEvent,
      overrides?.triggerFilter !== undefined ? overrides.triggerFilter : this.triggerFilter,
      overrides?.stepsGraph ?? this.stepsGraph,
      new Date(),
      new Date(),
    )
  }
}
