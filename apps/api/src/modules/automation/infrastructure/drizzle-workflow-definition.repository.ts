import { Injectable } from '@nestjs/common'
import { isDeepStrictEqual } from 'node:util'
import { and, eq, sql } from 'drizzle-orm'
import { getDb, workflowDefinitions as workflowDefinitionsTable } from '@crm/database'
import { ConflictError } from '@crm/shared'
import { WorkflowDefinitionRepository } from '../domain/repositories/workflow-definition.repository'
import { WorkflowDefinition } from '../domain/entities/workflow-definition.entity'
import { WorkflowMapper } from './workflow.mapper'

const allowedStatusTransitions: Record<WorkflowDefinition['status'], WorkflowDefinition['status'][]> = {
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['PAUSED', 'ARCHIVED'],
  PAUSED: ['ACTIVE', 'ARCHIVED'],
  ARCHIVED: [],
}

@Injectable()
export class DrizzleWorkflowDefinitionRepository extends WorkflowDefinitionRepository {
  private get db() {
    return getDb()
  }

  async save(definition: WorkflowDefinition): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${definition.tenantId}, true)`)

      const rows = await tx
        .select()
        .from(workflowDefinitionsTable)
        .where(
          and(
            eq(workflowDefinitionsTable.tenantId, definition.tenantId),
            eq(workflowDefinitionsTable.id, definition.id),
          ),
        )
        .limit(1)

      if (rows.length > 0) {
        const existing = WorkflowMapper.definitionToDomain(rows[0])
        const contentIsUnchanged =
          existing.id === definition.id &&
          existing.tenantId === definition.tenantId &&
          existing.name === definition.name &&
          existing.description === definition.description &&
          existing.version === definition.version &&
          existing.triggerEvent === definition.triggerEvent &&
          isDeepStrictEqual(existing.triggerFilter, definition.triggerFilter) &&
          isDeepStrictEqual(existing.stepsGraph, definition.stepsGraph) &&
          existing.createdAt.getTime() === definition.createdAt.getTime()

        if (!contentIsUnchanged) {
          throw new ConflictError(
            'Workflow versions are immutable; create a new version instead of changing a persisted definition',
          )
        }

        if (existing.status === definition.status) return

        if (!allowedStatusTransitions[existing.status].includes(definition.status)) {
          throw new ConflictError(
            `Invalid workflow status transition: ${existing.status} -> ${definition.status}`,
          )
        }

        await tx
          .update(workflowDefinitionsTable)
          .set({ status: definition.status, updatedAt: new Date() })
          .where(
            and(
              eq(workflowDefinitionsTable.tenantId, definition.tenantId),
              eq(workflowDefinitionsTable.id, definition.id),
              eq(workflowDefinitionsTable.status, existing.status),
            ),
          )
        return
      }

      await tx.insert(workflowDefinitionsTable).values({
        id: definition.id,
        tenantId: definition.tenantId,
        name: definition.name,
        description: definition.description,
        version: definition.version,
        status: definition.status,
        triggerEvent: definition.triggerEvent,
        triggerFilter: definition.triggerFilter,
        stepsGraph: definition.stepsGraph,
        createdAt: definition.createdAt,
        updatedAt: definition.updatedAt,
      })
    })
  }

  async findById(tenantId: string, id: string): Promise<WorkflowDefinition | null> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
      const rows = await tx
        .select()
        .from(workflowDefinitionsTable)
        .where(
          and(
            eq(workflowDefinitionsTable.tenantId, tenantId),
            eq(workflowDefinitionsTable.id, id),
          ),
        )
        .limit(1)

      return rows.length > 0 ? WorkflowMapper.definitionToDomain(rows[0]) : null
    })
  }

  async findActiveByTrigger(tenantId: string, triggerEvent: string): Promise<WorkflowDefinition[]> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
      const rows = await tx
        .select()
        .from(workflowDefinitionsTable)
        .where(
          and(
            eq(workflowDefinitionsTable.tenantId, tenantId),
            eq(workflowDefinitionsTable.status, 'ACTIVE'),
            eq(workflowDefinitionsTable.triggerEvent, triggerEvent),
          ),
        )

      return rows.map(WorkflowMapper.definitionToDomain)
    })
  }

  async list(tenantId: string, filters?: { status?: string }): Promise<WorkflowDefinition[]> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
      const conditions = [eq(workflowDefinitionsTable.tenantId, tenantId)]
      if (filters?.status) {
        conditions.push(eq(workflowDefinitionsTable.status, filters.status))
      }

      const rows = await tx
        .select()
        .from(workflowDefinitionsTable)
        .where(and(...conditions))

      return rows.map(WorkflowMapper.definitionToDomain)
    })
  }

  async delete(_tenantId: string, _id: string): Promise<void> {
    throw new ConflictError('Workflow versions are immutable; archive a version instead of deleting it')
  }
}
