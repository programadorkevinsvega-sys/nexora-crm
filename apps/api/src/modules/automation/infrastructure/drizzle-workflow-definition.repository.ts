import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, workflowDefinitions as workflowDefinitionsTable } from '@crm/database'
import { WorkflowDefinitionRepository } from '../domain/repositories/workflow-definition.repository'
import { WorkflowDefinition } from '../domain/entities/workflow-definition.entity'
import { WorkflowMapper } from './workflow.mapper'

@Injectable()
export class DrizzleWorkflowDefinitionRepository extends WorkflowDefinitionRepository {
  private get db() {
    return getDb()
  }

  async save(definition: WorkflowDefinition): Promise<void> {
    const existing = await this.findById(definition.tenantId, definition.id)
    if (existing) {
      await this.db
        .update(workflowDefinitionsTable)
        .set({
          name: definition.name,
          description: definition.description,
          status: definition.status,
          triggerEvent: definition.triggerEvent,
          triggerFilter: definition.triggerFilter,
          stepsGraph: definition.stepsGraph,
          updatedAt: definition.updatedAt,
        })
        .where(
          and(
            eq(workflowDefinitionsTable.tenantId, definition.tenantId),
            eq(workflowDefinitionsTable.id, definition.id),
          ),
        )
    } else {
      await this.db.insert(workflowDefinitionsTable).values({
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
    }
  }

  async findById(tenantId: string, id: string): Promise<WorkflowDefinition | null> {
    const rows = await this.db
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
  }

  async findActiveByTrigger(tenantId: string, triggerEvent: string): Promise<WorkflowDefinition[]> {
    const rows = await this.db
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
  }

  async list(tenantId: string, filters?: { status?: string }): Promise<WorkflowDefinition[]> {
    const conditions = [eq(workflowDefinitionsTable.tenantId, tenantId)]
    if (filters?.status) {
      conditions.push(eq(workflowDefinitionsTable.status, filters.status))
    }

    const rows = await this.db
      .select()
      .from(workflowDefinitionsTable)
      .where(and(...conditions))

    return rows.map(WorkflowMapper.definitionToDomain)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(workflowDefinitionsTable)
      .where(
        and(
          eq(workflowDefinitionsTable.tenantId, tenantId),
          eq(workflowDefinitionsTable.id, id),
        ),
      )
  }
}
