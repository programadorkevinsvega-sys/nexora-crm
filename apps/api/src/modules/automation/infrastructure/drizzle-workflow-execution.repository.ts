import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, workflowExecutions as workflowExecutionsTable, workflowStepExecutions as workflowStepExecutionsTable } from '@crm/database'
import { WorkflowExecutionRepository } from '../domain/repositories/workflow-execution.repository'
import { WorkflowExecution } from '../domain/entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../domain/entities/workflow-step-execution.entity'
import { WorkflowMapper } from './workflow.mapper'

@Injectable()
export class DrizzleWorkflowExecutionRepository extends WorkflowExecutionRepository {
  private get db() {
    return getDb()
  }

  async save(execution: WorkflowExecution): Promise<void> {
    const existing = await this.findById(execution.tenantId, execution.id)
    if (existing) {
      await this.db
        .update(workflowExecutionsTable)
        .set({
          status: execution.status,
          currentStepId: execution.currentStepId,
          contextData: execution.contextData,
          completedAt: execution.completedAt,
          cancelledAt: execution.cancelledAt,
          errorMessage: execution.errorMessage,
        })
        .where(
          and(
            eq(workflowExecutionsTable.tenantId, execution.tenantId),
            eq(workflowExecutionsTable.id, execution.id),
          ),
        )
    } else {
      await this.db.insert(workflowExecutionsTable).values({
        id: execution.id,
        tenantId: execution.tenantId,
        workflowId: execution.workflowId,
        version: execution.version,
        entityType: execution.entityType,
        entityId: execution.entityId,
        status: execution.status,
        currentStepId: execution.currentStepId,
        contextData: execution.contextData,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        cancelledAt: execution.cancelledAt,
        errorMessage: execution.errorMessage,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<WorkflowExecution | null> {
    const rows = await this.db
      .select()
      .from(workflowExecutionsTable)
      .where(
        and(
          eq(workflowExecutionsTable.tenantId, tenantId),
          eq(workflowExecutionsTable.id, id),
        ),
      )
      .limit(1)

    return rows.length > 0 ? WorkflowMapper.executionToDomain(rows[0]) : null
  }

  async findRunningByEntity(tenantId: string, entityType: string, entityId: string): Promise<WorkflowExecution[]> {
    const rows = await this.db
      .select()
      .from(workflowExecutionsTable)
      .where(
        and(
          eq(workflowExecutionsTable.tenantId, tenantId),
          eq(workflowExecutionsTable.entityType, entityType),
          eq(workflowExecutionsTable.entityId, entityId),
          eq(workflowExecutionsTable.status, 'RUNNING'),
        ),
      )

    return rows.map(WorkflowMapper.executionToDomain)
  }

  async listExecutions(tenantId: string, filters?: { workflowId?: string; status?: string }): Promise<WorkflowExecution[]> {
    const conditions = [eq(workflowExecutionsTable.tenantId, tenantId)]
    if (filters?.workflowId) {
      conditions.push(eq(workflowExecutionsTable.workflowId, filters.workflowId))
    }
    if (filters?.status) {
      conditions.push(eq(workflowExecutionsTable.status, filters.status))
    }

    const rows = await this.db
      .select()
      .from(workflowExecutionsTable)
      .where(and(...conditions))

    return rows.map(WorkflowMapper.executionToDomain)
  }

  async saveStepExecution(step: WorkflowStepExecution): Promise<void> {
    const existing = await this.findStepExecutionByIdempotencyKey(step.tenantId, step.idempotencyKey)
    if (existing) {
      await this.db
        .update(workflowStepExecutionsTable)
        .set({
          status: step.status,
          attempts: step.attempts,
          outputData: step.outputData,
          errorMessage: step.errorMessage,
          completedAt: step.completedAt,
        })
        .where(
          and(
            eq(workflowStepExecutionsTable.tenantId, step.tenantId),
            eq(workflowStepExecutionsTable.idempotencyKey, step.idempotencyKey),
          ),
        )
    } else {
      await this.db.insert(workflowStepExecutionsTable).values({
        id: step.id,
        tenantId: step.tenantId,
        executionId: step.executionId,
        stepId: step.stepId,
        idempotencyKey: step.idempotencyKey,
        status: step.status,
        attempts: step.attempts,
        outputData: step.outputData,
        errorMessage: step.errorMessage,
        startedAt: step.startedAt,
        completedAt: step.completedAt,
      })
    }
  }

  async findStepExecutionByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<WorkflowStepExecution | null> {
    const rows = await this.db
      .select()
      .from(workflowStepExecutionsTable)
      .where(
        and(
          eq(workflowStepExecutionsTable.tenantId, tenantId),
          eq(workflowStepExecutionsTable.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1)

    return rows.length > 0 ? WorkflowMapper.stepExecutionToDomain(rows[0]) : null
  }

  async listStepExecutions(tenantId: string, executionId: string): Promise<WorkflowStepExecution[]> {
    const rows = await this.db
      .select()
      .from(workflowStepExecutionsTable)
      .where(
        and(
          eq(workflowStepExecutionsTable.tenantId, tenantId),
          eq(workflowStepExecutionsTable.executionId, executionId),
        ),
      )

    return rows.map(WorkflowMapper.stepExecutionToDomain)
  }
}
