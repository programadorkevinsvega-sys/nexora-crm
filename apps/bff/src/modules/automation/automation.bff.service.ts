import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  WorkflowDefinition,
  CreateWorkflow,
  WorkflowExecution,
} from '@crm/contracts'

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'automation:'

@Injectable()
export class AutomationBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createWorkflow(dto: CreateWorkflow, tenantId: string): Promise<WorkflowDefinition> {
    const workflow = await this.api.createWorkflow({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return workflow
  }

  async getWorkflow(id: string, tenantId: string): Promise<WorkflowDefinition> {
    const cacheKey = `${CACHE_KEY_PREFIX}wf:${id}:${tenantId}`
    return this.cache.getOrSet<WorkflowDefinition>(
      cacheKey,
      () => this.api.getWorkflow(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async listWorkflows(tenantId: string, status?: string): Promise<WorkflowDefinition[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}:${status ?? 'all'}`
    return this.cache.getOrSet<WorkflowDefinition[]>(
      cacheKey,
      () => this.api.listWorkflows(tenantId, status),
      CACHE_TTL_MS,
    )
  }

  async activateWorkflow(id: string, tenantId: string): Promise<WorkflowDefinition> {
    const workflow = await this.api.activateWorkflow(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return workflow
  }

  async pauseWorkflow(id: string, tenantId: string): Promise<WorkflowDefinition> {
    const workflow = await this.api.pauseWorkflow(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return workflow
  }

  async triggerEvent(
    data: { eventName: string; entityType: string; entityId: string; payload: Record<string, unknown> },
    tenantId: string,
  ): Promise<{ triggeredCount: number }> {
    return this.api.triggerAutomationEvent({ tenantId, ...data })
  }

  async getExecution(
    executionId: string,
    tenantId: string,
  ): Promise<{ execution: WorkflowExecution; steps: any[] }> {
    return this.api.getWorkflowExecution(tenantId, executionId)
  }

  async listExecutions(
    tenantId: string,
    workflowId?: string,
    status?: string,
  ): Promise<WorkflowExecution[]> {
    return this.api.listWorkflowExecutions({ tenantId, workflowId, status })
  }

  async cancelExecution(executionId: string, reason: string | undefined, tenantId: string): Promise<void> {
    return this.api.cancelWorkflowExecution(tenantId, executionId, reason)
  }
}
