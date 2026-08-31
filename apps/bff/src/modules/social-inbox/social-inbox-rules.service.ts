import { Injectable, Logger } from '@nestjs/common'
import { getDb, socialAutoResponderRules } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type { SocialAutoResponderRule } from '@crm/contracts'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class SocialInboxRulesService {
  private readonly logger = new Logger(SocialInboxRulesService.name)

  private get db() { return getDb() }

  async listRules(tenantId?: string): Promise<SocialAutoResponderRule[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const rows = await this.db
      .select()
      .from(socialAutoResponderRules)
      .where(eq(socialAutoResponderRules.tenantId, tid))
      .orderBy(desc(socialAutoResponderRules.createdAt))
    return rows.map(this.toDto)
  }

  async saveRule(dto: Partial<SocialAutoResponderRule>, tenantId?: string): Promise<SocialAutoResponderRule> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const now = new Date()

    if (dto.id) {
      const [updated] = await this.db
        .update(socialAutoResponderRules)
        .set({
          name: dto.name,
          platform: dto.platform,
          triggerKeywords: dto.triggerKeywords ?? [],
          responseMode: dto.responseMode,
          staticReplies: dto.staticReplies ?? [],
          aiPrompt: dto.aiPrompt ?? null,
          sendPrivateDm: dto.sendPrivateDm ?? false,
          autoCreateLead: dto.autoCreateLead ?? true,
          isEnabled: dto.isEnabled ?? true,
          targetPostIds: (dto as any).targetPostIds ?? [],
          knowledgeCategoryIds: (dto as any).knowledgeCategoryIds ?? [],
          updatedAt: now,
        })
        .where(and(eq(socialAutoResponderRules.id, dto.id), eq(socialAutoResponderRules.tenantId, tid)))
        .returning()
      if (updated) {
        this.logger.log(`Updated rule ${dto.id}`)
        return this.toDto(updated)
      }
    }

    const [created] = await this.db.insert(socialAutoResponderRules).values({
      tenantId: tid,
      name: dto.name || 'Nueva Regla',
      platform: dto.platform || 'ALL',
      triggerKeywords: dto.triggerKeywords ?? [],
      responseMode: dto.responseMode || 'STATIC_TEMPLATE',
      staticReplies: dto.staticReplies ?? ['¡Hola {name}! Gracias por tu comentario 🚀'],
      aiPrompt: dto.aiPrompt ?? null,
      sendPrivateDm: dto.sendPrivateDm ?? false,
      autoCreateLead: dto.autoCreateLead ?? true,
      isEnabled: dto.isEnabled ?? true,
      targetPostIds: (dto as any).targetPostIds ?? [],
      knowledgeCategoryIds: (dto as any).knowledgeCategoryIds ?? [],
      createdAt: now,
      updatedAt: now,
    }).returning()

    this.logger.log(`Created rule ${created.id}`)
    return this.toDto(created)
  }

  async deleteRule(ruleId: string, tenantId?: string): Promise<{ success: boolean }> {
    const tid = tenantId || DEFAULT_TENANT_ID
    await this.db
      .delete(socialAutoResponderRules)
      .where(and(eq(socialAutoResponderRules.id, ruleId), eq(socialAutoResponderRules.tenantId, tid)))
    return { success: true }
  }

  async getEnabledRulesForPlatform(tenantId: string, platform: string): Promise<SocialAutoResponderRule[]> {
    const rows = await this.db
      .select()
      .from(socialAutoResponderRules)
      .where(and(
        eq(socialAutoResponderRules.tenantId, tenantId),
        eq(socialAutoResponderRules.isEnabled, true),
      ))
    return rows
      .filter((r) => r.platform === 'ALL' || r.platform === platform)
      .map(this.toDto)
  }

  private toDto(row: typeof socialAutoResponderRules.$inferSelect): SocialAutoResponderRule {
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      platform: row.platform as SocialAutoResponderRule['platform'],
      triggerKeywords: (row.triggerKeywords as string[]) ?? [],
      responseMode: row.responseMode as SocialAutoResponderRule['responseMode'],
      staticReplies: (row.staticReplies as string[]) ?? [],
      aiPrompt: row.aiPrompt ?? undefined,
      sendPrivateDm: row.sendPrivateDm,
      autoCreateLead: row.autoCreateLead,
      pipelineId: row.pipelineId ?? undefined,
      stageId: row.stageId ?? undefined,
      isEnabled: row.isEnabled,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }
  }
}
