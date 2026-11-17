import { Injectable } from '@nestjs/common'
import { eq, and, desc } from 'drizzle-orm'
import { getDb, leadScoringRules as rulesTable, leadScores as scoresTable } from '@crm/database'
import { LeadScoringRuleRepository, LeadScoreRepository } from '../domain/repositories/lead-scoring.repository'
import { LeadScoringRule } from '../domain/entities/lead-scoring-rule.entity'
import { LeadScore } from '../domain/entities/lead-score.entity'
import { LeadScoringMapper } from './lead-scoring.mapper'

@Injectable()
export class DrizzleLeadScoringRuleRepository extends LeadScoringRuleRepository {
  private get db() {
    return getDb()
  }

  async save(rule: LeadScoringRule): Promise<void> {
    const existing = await this.findById(rule.tenantId, rule.id)
    if (existing) {
      await this.db
        .update(rulesTable)
        .set({
          name: rule.name,
          description: rule.description,
          category: rule.category,
          condition: rule.condition,
          points: rule.points,
          decayDays: rule.decayDays,
          decayPoints: rule.decayPoints,
          isActive: rule.isActive,
          updatedAt: rule.updatedAt,
        })
        .where(and(eq(rulesTable.tenantId, rule.tenantId), eq(rulesTable.id, rule.id)))
    } else {
      await this.db.insert(rulesTable).values({
        id: rule.id,
        tenantId: rule.tenantId,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        condition: rule.condition,
        points: rule.points,
        decayDays: rule.decayDays,
        decayPoints: rule.decayPoints,
        isActive: rule.isActive,
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<LeadScoringRule | null> {
    const rows = await this.db
      .select()
      .from(rulesTable)
      .where(and(eq(rulesTable.tenantId, tenantId), eq(rulesTable.id, id)))
      .limit(1)

    return rows.length > 0 ? LeadScoringMapper.ruleToDomain(rows[0]) : null
  }

  async listActive(tenantId: string): Promise<LeadScoringRule[]> {
    const rows = await this.db
      .select()
      .from(rulesTable)
      .where(and(eq(rulesTable.tenantId, tenantId), eq(rulesTable.isActive, true)))

    return rows.map(LeadScoringMapper.ruleToDomain)
  }

  async listAll(tenantId: string): Promise<LeadScoringRule[]> {
    const rows = await this.db
      .select()
      .from(rulesTable)
      .where(eq(rulesTable.tenantId, tenantId))

    return rows.map(LeadScoringMapper.ruleToDomain)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(rulesTable)
      .where(and(eq(rulesTable.tenantId, tenantId), eq(rulesTable.id, id)))
  }
}

@Injectable()
export class DrizzleLeadScoreRepository extends LeadScoreRepository {
  private get db() {
    return getDb()
  }

  async save(leadScore: LeadScore): Promise<void> {
    const existing = await this.findByContactId(leadScore.tenantId, leadScore.contactId)
    if (existing) {
      await this.db
        .update(scoresTable)
        .set({
          score: leadScore.score,
          temperature: leadScore.temperature,
          lastActivityAt: leadScore.lastActivityAt,
          history: leadScore.history,
          updatedAt: leadScore.updatedAt,
        })
        .where(and(eq(scoresTable.tenantId, leadScore.tenantId), eq(scoresTable.contactId, leadScore.contactId)))
    } else {
      await this.db.insert(scoresTable).values({
        id: leadScore.id,
        tenantId: leadScore.tenantId,
        contactId: leadScore.contactId,
        score: leadScore.score,
        temperature: leadScore.temperature,
        lastActivityAt: leadScore.lastActivityAt,
        history: leadScore.history,
        createdAt: leadScore.createdAt,
        updatedAt: leadScore.updatedAt,
      })
    }
  }

  async findByContactId(tenantId: string, contactId: string): Promise<LeadScore | null> {
    const rows = await this.db
      .select()
      .from(scoresTable)
      .where(and(eq(scoresTable.tenantId, tenantId), eq(scoresTable.contactId, contactId)))
      .limit(1)

    return rows.length > 0 ? LeadScoringMapper.scoreToDomain(rows[0]) : null
  }

  async listTopLeads(tenantId: string, limit = 20): Promise<LeadScore[]> {
    const rows = await this.db
      .select()
      .from(scoresTable)
      .where(eq(scoresTable.tenantId, tenantId))
      .orderBy(desc(scoresTable.score))
      .limit(limit)

    return rows.map(LeadScoringMapper.scoreToDomain)
  }

  async listByTemperature(tenantId: string, temperature: string): Promise<LeadScore[]> {
    const rows = await this.db
      .select()
      .from(scoresTable)
      .where(and(eq(scoresTable.tenantId, tenantId), eq(scoresTable.temperature, temperature)))
      .orderBy(desc(scoresTable.score))

    return rows.map(LeadScoringMapper.scoreToDomain)
  }
}
