import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, slaPolicies, slaEscalationRules, ticketSlaTrackers } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type {
  SlaPolicy,
  CreateSlaPolicyDto,
  SlaEscalationRule,
  CreateSlaEscalationRuleDto,
  TicketSlaTracker,
} from '@crm/contracts'

@Injectable()
export class SlaBffService {
  private readonly logger = new Logger(SlaBffService.name)
  private get db() {
    return getDb()
  }

  async listPolicies(tenantId: string): Promise<SlaPolicy[]> {
    let rows = await this.db
      .select()
      .from(slaPolicies)
      .where(eq(slaPolicies.tenantId, tenantId))
      .orderBy(desc(slaPolicies.isDefault), desc(slaPolicies.createdAt))

    if (rows.length === 0) {
      await this.seedDefaultPolicies(tenantId)
      rows = await this.db
        .select()
        .from(slaPolicies)
        .where(eq(slaPolicies.tenantId, tenantId))
        .orderBy(desc(slaPolicies.isDefault), desc(slaPolicies.createdAt))
    }

    return rows.map((r) => this.mapPolicy(r))
  }

  async createPolicy(tenantId: string, dto: CreateSlaPolicyDto): Promise<SlaPolicy> {
    const [created] = await this.db
      .insert(slaPolicies)
      .values({
        tenantId,
        name: dto.name,
        description: dto.description || null,
        priority: dto.priority || 'HIGH',
        firstResponseTimeMinutes: dto.firstResponseTimeMinutes || 60,
        resolutionTimeMinutes: dto.resolutionTimeMinutes || 240,
        businessHoursOnly: dto.businessHoursOnly ?? true,
        isDefault: dto.isDefault ?? false,
        isActive: dto.isActive ?? true,
      })
      .returning()

    this.logger.log(`Created SLA Policy: ${created.id} (${created.name})`)
    return this.mapPolicy(created)
  }

  async listEscalationRules(tenantId: string, policyId: string): Promise<SlaEscalationRule[]> {
    const rows = await this.db
      .select()
      .from(slaEscalationRules)
      .where(and(eq(slaEscalationRules.tenantId, tenantId), eq(slaEscalationRules.policyId, policyId)))
      .orderBy(slaEscalationRules.level)

    return rows.map((r) => this.mapRule(r))
  }

  async createEscalationRule(
    tenantId: string,
    dto: CreateSlaEscalationRuleDto,
  ): Promise<SlaEscalationRule> {
    const [created] = await this.db
      .insert(slaEscalationRules)
      .values({
        tenantId,
        policyId: dto.policyId,
        level: dto.level || 1,
        triggerAfterMinutes: dto.triggerAfterMinutes,
        actionType: dto.actionType || 'NOTIFY_MANAGER',
        targetUserId: dto.targetUserId || null,
        targetTeamId: dto.targetTeamId || null,
        isActive: dto.isActive ?? true,
      })
      .returning()

    return this.mapRule(created)
  }

  async listTrackers(tenantId: string): Promise<TicketSlaTracker[]> {
    const rows = await this.db
      .select()
      .from(ticketSlaTrackers)
      .where(eq(ticketSlaTrackers.tenantId, tenantId))
      .orderBy(desc(ticketSlaTrackers.updatedAt))

    return rows.map((r) => this.mapTracker(r))
  }

  private async seedDefaultPolicies(tenantId: string) {
    await this.db.insert(slaPolicies).values([
      {
        tenantId,
        name: 'SLA Premium 24/7 (Prioridad Crítica)',
        description: 'Compromiso de primera respuesta en 15m y resolución en 2h para caídas de servicio.',
        priority: 'CRITICAL',
        firstResponseTimeMinutes: 15,
        resolutionTimeMinutes: 120,
        businessHoursOnly: false,
        isDefault: true,
        isActive: true,
      },
      {
        tenantId,
        name: 'SLA Comercial Estándar (Prioridad Alta)',
        description: 'Respuesta en 1h y resolución en 8h dentro de horario laboral.',
        priority: 'HIGH',
        firstResponseTimeMinutes: 60,
        resolutionTimeMinutes: 480,
        businessHoursOnly: true,
        isDefault: false,
        isActive: true,
      },
      {
        tenantId,
        name: 'SLA General (Prioridad Media)',
        description: 'Respuesta en 4h y resolución en 24h para consultas no bloqueantes.',
        priority: 'MEDIUM',
        firstResponseTimeMinutes: 240,
        resolutionTimeMinutes: 1440,
        businessHoursOnly: true,
        isDefault: false,
        isActive: true,
      },
    ])
  }

  private mapPolicy(r: any): SlaPolicy {
    return {
      ...r,
      priority: r.priority as any,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapRule(r: any): SlaEscalationRule {
    return {
      ...r,
      actionType: r.actionType as any,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapTracker(r: any): TicketSlaTracker {
    return {
      ...r,
      firstResponseDueAt: r.firstResponseDueAt ? new Date(r.firstResponseDueAt).toISOString() : new Date().toISOString(),
      firstRespondedAt: r.firstRespondedAt ? new Date(r.firstRespondedAt).toISOString() : undefined,
      resolutionDueAt: r.resolutionDueAt ? new Date(r.resolutionDueAt).toISOString() : new Date().toISOString(),
      resolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toISOString() : undefined,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }
}
