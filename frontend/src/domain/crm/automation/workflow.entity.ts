export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
export type WorkflowExecutionStatus = 'RUNNING' | 'WAITING_DELAY' | 'COMPLETED' | 'CANCELLED' | 'FAILED'
export type WorkflowStepStatus = 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED' | 'SKIPPED'
export type StepType = 'ACTION' | 'DELAY' | 'CONDITION' | 'BRANCH' | 'WEBHOOK'

export interface WorkflowStep {
  id: string
  name?: string
  type: StepType
  action?: string
  config?: Record<string, unknown>
  duration?: string
  condition?: {
    field: string
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN' | 'IS_EMPTY'
    value: unknown
  }
  nextStepId?: string
  onTrueStepId?: string
  onFalseStepId?: string
}

export interface WorkflowDefinition {
  id: string
  tenantId: string
  name: string
  description?: string | null
  version: number
  status: WorkflowStatus
  triggerEvent: string
  triggerFilter?: Record<string, unknown> | null
  stepsGraph: WorkflowStep[]
  createdAt: string
  updatedAt: string
}

export interface WorkflowExecution {
  id: string
  tenantId: string
  workflowId: string
  version: number
  entityType: string
  entityId: string
  status: WorkflowExecutionStatus
  currentStepId: string
  contextData?: Record<string, unknown> | null
  startedAt: string
  completedAt?: string | null
  cancelledAt?: string | null
  errorMessage?: string | null
}

export interface WorkflowStepExecution {
  id: string
  tenantId: string
  executionId: string
  stepId: string
  idempotencyKey: string
  status: WorkflowStepStatus
  attempts: number
  outputData?: Record<string, unknown> | null
  errorMessage?: string | null
  startedAt: string
  completedAt?: string | null
}
