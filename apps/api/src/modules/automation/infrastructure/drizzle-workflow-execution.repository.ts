import { Injectable } from '@nestjs/common'
import { and, eq, sql } from 'drizzle-orm'
import {
  getDb,
  workflowExecutions as workflowExecutionsTable,
  workflowStepExecutions as workflowStepExecutionsTable,
} from '@crm/database'
import { ConflictError } from '@crm/shared'
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
    await this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${execution.tenantId}, true)`)

      const rows = await tx
        .select()
        .from(workflowExecutionsTable)
        .where(
          and(
            eq(workflowExecutionsTable.tenantId, execution.tenantId),
            eq(workflowExecutionsTable.id, execution.id),
          ),
        )
        .limit(1)

      if (rows.length > 0) {
        const existing = WorkflowMapper.executionToDomain(rows[0])
        const identityIsUnchanged =
          existing.id === execution.id &&
          existing.tenantId === execution.tenantId &&
          existing.workflowId === execution.workflowId &&
          existing.version === execution.version &&
          existing.entityType === execution.entityType &&
          existing.entityId === execution.entityId &&
          existing.startedAt.getTime() === execution.startedAt.getTime()

        if (!identityIsUnchanged) {
          throw new ConflictError('Workflow execution identity and source version are immutable')
        }

        await tx
          .update(workflowExecutionsTable)
          .set({
            status: execution.status,
            currentStepId: execution.currentStepId,
            contextData: execution.contextData,
            resumeAt: execution.resumeAt,
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
        return
      }

      await tx.insert(workflowExecutionsTable).values({
        id: execution.id,
        tenantId: execution.tenantId,
        workflowId: execution.workflowId,
        version: execution.version,
        entityType: execution.entityType,
        entityId: execution.entityId,
        status: execution.status,
        currentStepId: execution.currentStepId,
        contextData: execution.contextData,
        resumeAt: execution.resumeAt,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        cancelledAt: execution.cancelledAt,
        errorMessage: execution.errorMessage,
      })
    })
  }

  async findById(tenantId: string, id: string): Promise<WorkflowExecution | null> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
      const rows = await tx
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
    })
  }

  async findRunningByEntity(tenantId: string, entityType: string, entityId: string): Promise<WorkflowExecution[]> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
      const rows = await tx
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
    })
  }

  async listExecutions(tenantId: string, filters?: { workflowId?: string; status?: string }): Promise<WorkflowExecution[]> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
      const conditions = [eq(workflowExecutionsTable.tenantId, tenantId)]
      if (filters?.workflowId) {
        conditions.push(eq(workflowExecutionsTable.workflowId, filters.workflowId))
      }
      if (filters?.status) {
        conditions.push(eq(workflowExecutionsTable.status, filters.status))
      }

      const rows = await tx
        .select()
        .from(workflowExecutionsTable)
        .where(and(...conditions))

      return rows.map(WorkflowMapper.executionToDomain)
    })
  }

  async saveStepExecution(step: WorkflowStepExecution): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${step.tenantId}, true)`)

      const rows = await tx
        .select()
        .from(workflowStepExecutionsTable)
        .where(
          and(
            eq(workflowStepExecutionsTable.tenantId, step.tenantId),
            eq(workflowStepExecutionsTable.idempotencyKey, step.idempotencyKey),
          ),
        )
        .limit(1)

      if (rows.length > 0) {
        const existing = WorkflowMapper.stepExecutionToDomain(rows[0])
        const identityIsUnchanged =
          existing.id === step.id &&
          existing.tenantId === step.tenantId &&
          existing.executionId === step.executionId &&
          existing.stepId === step.stepId &&
          existing.idempotencyKey === step.idempotencyKey &&
          existing.attempts === step.attempts &&
          existing.startedAt.getTime() === step.startedAt.getTime()

        if (!identityIsUnchanged) {
          throw new ConflictError('Workflow step execution identity and idempotency key are immutable')
        }

        await tx
          .update(workflowStepExecutionsTable)
          .set({
            status: step.status,
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
        return
      }

      await tx.insert(workflowStepExecutionsTable).values({
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
    })
  }

  async findStepExecutionByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<WorkflowStepExecution | null> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
      const rows = await tx
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
    })
  }

  async listStepExecutions(tenantId: string, executionId: string): Promise<WorkflowStepExecution[]> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
      const rows = await tx
        .select()
        .from(workflowStepExecutionsTable)
        .where(
          and(
            eq(workflowStepExecutionsTable.tenantId, tenantId),
            eq(workflowStepExecutionsTable.executionId, executionId),
          ),
        )

      return rows.map(WorkflowMapper.stepExecutionToDomain)
    })
  }
}
