import { api, qs } from "../../api/api-client"
import type {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStepExecution,
} from "@/src/domain/crm/automation/workflow.entity"

function normalizeWf(wf: any): WorkflowDefinition | null {
  if (!wf) return null
  let steps = wf.stepsGraph
  if (typeof steps === "string") {
    try {
      steps = JSON.parse(steps)
    } catch {
      steps = []
    }
  }
  if (!Array.isArray(steps)) {
    if (steps && typeof steps === "object") {
      steps = Array.isArray(steps.nodes) ? steps.nodes : Array.isArray(steps.steps) ? steps.steps : []
    } else {
      steps = []
    }
  }
  return { ...wf, stepsGraph: steps }
}

export const ApiAutomationRepository = {
  async listWorkflows(status?: string): Promise<WorkflowDefinition[]> {
    const params = status ? { status } : {}
    const res = await api.get<any>(`/api/automation/workflows${qs(params)}`)
    const list = Array.isArray(res) ? res : []
    return list.map(normalizeWf).filter(Boolean) as WorkflowDefinition[]
  },

  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    const wf = await api.get<any>(`/api/automation/workflows/${id}`)
    return normalizeWf(wf)
  },

  async createWorkflow(data: {
    name: string
    description?: string
    triggerEvent: string
    triggerFilter?: Record<string, unknown>
    stepsGraph: any[]
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
    const res = await api.get<any>(`/api/automation/executions${qs(params ?? {})}`)
    return Array.isArray(res) ? res : []
  },

  async getExecution(id: string): Promise<{ execution: WorkflowExecution; steps: WorkflowStepExecution[] } | null> {
    return api.get<any>(`/api/automation/executions/${id}`)
  },

  async cancelExecution(id: string, reason?: string): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>(`/api/automation/executions/${id}/cancel`, { reason })
  },
}
