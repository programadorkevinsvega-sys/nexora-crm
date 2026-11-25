import { api, qs } from "../../api/api-client"
import type {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  WorkflowStepExecution,
} from "@/src/domain/crm/automation/workflow.entity"

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isWorkflowStep(value: unknown): value is WorkflowStep {
  if (!isRecord(value) || typeof value.id !== "string") return false
  if (value.type !== "ACTION" && value.type !== "DELAY" && value.type !== "CONDITION" && value.type !== "BRANCH" && value.type !== "WEBHOOK") return false
  if (value.config !== undefined && value.config !== null && !isRecord(value.config)) return false
  if (value.condition !== undefined && value.condition !== null) {
    if (!isRecord(value.condition) || typeof value.condition.field !== "string" || typeof value.condition.operator !== "string") return false
  }
  return true
}

function workflowSteps(value: unknown): WorkflowStep[] | null {
  let parsed: unknown = value
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return null
    }
  }
  if (isRecord(parsed)) {
    parsed = Array.isArray(parsed.nodes) ? parsed.nodes : parsed.steps
  }
  if (!Array.isArray(parsed) || !parsed.every(isWorkflowStep)) return null
  return parsed
}

function normalizeWorkflow(value: unknown): WorkflowDefinition | null {
  if (!isRecord(value)
    || typeof value.id !== "string"
    || typeof value.tenantId !== "string"
    || typeof value.name !== "string"
    || typeof value.version !== "number"
    || (value.status !== "DRAFT" && value.status !== "ACTIVE" && value.status !== "PAUSED" && value.status !== "ARCHIVED")
    || typeof value.triggerEvent !== "string"
    || typeof value.createdAt !== "string"
    || typeof value.updatedAt !== "string") return null
  const stepsGraph = workflowSteps(value.stepsGraph)
  if (!stepsGraph) return null
  return {
    id: value.id,
    tenantId: value.tenantId,
    name: value.name,
    description: typeof value.description === "string" || value.description === null ? value.description : undefined,
    version: value.version,
    status: value.status,
    triggerEvent: value.triggerEvent,
    triggerFilter: isRecord(value.triggerFilter) ? value.triggerFilter : null,
    stepsGraph,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

function isWorkflowExecution(value: unknown): value is WorkflowExecution {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.tenantId === "string"
    && typeof value.workflowId === "string"
    && typeof value.version === "number"
    && typeof value.entityType === "string"
    && typeof value.entityId === "string"
    && (value.status === "RUNNING" || value.status === "WAITING_DELAY" || value.status === "COMPLETED" || value.status === "CANCELLED" || value.status === "FAILED")
    && typeof value.currentStepId === "string"
    && typeof value.startedAt === "string"
}

function isWorkflowStepExecution(value: unknown): value is WorkflowStepExecution {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.tenantId === "string"
    && typeof value.executionId === "string"
    && typeof value.stepId === "string"
    && typeof value.idempotencyKey === "string"
    && (value.status === "PENDING" || value.status === "EXECUTING" || value.status === "SUCCESS" || value.status === "FAILED" || value.status === "SKIPPED")
    && typeof value.attempts === "number"
    && typeof value.startedAt === "string"
}

function responseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  return isRecord(value) && Array.isArray(value.data) ? value.data : []
}

export const ApiAutomationRepository = {
  async listWorkflows(status?: string): Promise<WorkflowDefinition[]> {
    const params = status ? { status } : {}
    const response = await api.get<unknown>(`/api/automation/workflows${qs(params)}`)
    return responseArray(response).flatMap((item) => {
      const workflow = normalizeWorkflow(item)
      return workflow ? [workflow] : []
    })
  },

  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    return normalizeWorkflow(await api.get<unknown>(`/api/automation/workflows/${id}`))
  },

  async createWorkflow(data: {
    name: string
    description?: string
    triggerEvent: string
    triggerFilter?: Record<string, unknown>
    stepsGraph: WorkflowStep[]
  }): Promise<WorkflowDefinition> {
    return api.post<WorkflowDefinition>("/api/automation/workflows", data)
  },

  async activateWorkflow(id: string): Promise<WorkflowDefinition> {
    return api.post<WorkflowDefinition>(`/api/automation/workflows/${id}/activate`, {})
  },

  async pauseWorkflow(id: string): Promise<WorkflowDefinition> {
    return api.post<WorkflowDefinition>(`/api/automation/workflows/${id}/pause`, {})
  },

  async triggerEvent(data: {
    eventName: string
    entityType: string
    entityId: string
    payload: Record<string, unknown>
  }): Promise<{ triggeredCount: number }> {
    return api.post<{ triggeredCount: number }>("/api/automation/trigger", data)
  },

  async listExecutions(params?: { workflowId?: string; status?: string }): Promise<WorkflowExecution[]> {
    const response = await api.get<unknown>(`/api/automation/executions${qs(params ?? {})}`)
    return responseArray(response).filter(isWorkflowExecution)
  },

  async getExecution(id: string): Promise<{ execution: WorkflowExecution; steps: WorkflowStepExecution[] } | null> {
    const response: unknown = await api.get<unknown>(`/api/automation/executions/${id}`)
    if (!isRecord(response) || !isWorkflowExecution(response.execution) || !Array.isArray(response.steps)) return null
    const steps = response.steps.filter(isWorkflowStepExecution)
    if (steps.length !== response.steps.length) return null
    return { execution: response.execution, steps }
  },

  async cancelExecution(id: string, reason?: string): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>(`/api/automation/executions/${id}/cancel`, { reason })
  },
}
