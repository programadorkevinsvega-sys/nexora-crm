import { Injectable } from '@nestjs/common'
import { getDb, socialComments, socialAutoResponderRules, contacts } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { SocialInboxRepository } from '../../../domain/repositories/social-inbox.repository'
import { SocialComment } from '../../../domain/entities/social-comment.entity'
import { SocialAutoResponderRule } from '../../../domain/entities/social-rule.entity'

@Injectable()
export class DrizzleSocialInboxRepository implements SocialInboxRepository {
  private get db() {
    return getDb()
  }

  async listComments(tenantId: string, platform?: string, status?: string): Promise<SocialComment[]> {
    const conditions = [eq(socialComments.tenantId, tenantId)]
    if (platform && platform !== 'ALL') conditions.push(eq(socialComments.platform, platform))
    if (status && status !== 'ALL') conditions.push(eq(socialComments.status, status))

    const rows = await this.db
      .select()
      .from(socialComments)
      .where(and(...conditions))
      .orderBy(desc(socialComments.createdAt))
      .limit(100)

    return rows.map(r => this.mapComment(r))
  }

  async getComment(tenantId: string, id: string): Promise<SocialComment | null> {
    const [row] = await this.db
      .select()
      .from(socialComments)
      .where(and(eq(socialComments.tenantId, tenantId), eq(socialComments.id, id)))
    return row ? this.mapComment(row) : null
  }

  async saveComment(c: SocialComment): Promise<void> {
    await this.db.insert(socialComments).values({
      id: c.id,
      tenantId: c.tenantId,
      platform: c.platform,
      postType: c.postType,
      postId: c.postId,
      postTitle: c.postTitle,
      authorId: c.authorId,
      authorName: c.authorName,
      authorAvatarUrl: c.authorAvatarUrl,
      commentId: c.commentId,
      parentCommentId: c.parentCommentId,
      message: c.message,
      sentiment: c.sentiment,
      status: c.status,
      replyMessage: c.replyMessage,
      repliedAt: c.repliedAt,
      repliedBy: c.repliedBy,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }).onConflictDoUpdate({
      target: socialComments.id,
      set: {
        status: c.status,
        replyMessage: c.replyMessage,
        repliedAt: c.repliedAt,
        repliedBy: c.repliedBy,
        updatedAt: c.updatedAt,
      },
    })
  }

  async listRules(tenantId: string): Promise<SocialAutoResponderRule[]> {
    const rows = await this.db
      .select()
      .from(socialAutoResponderRules)
      .where(eq(socialAutoResponderRules.tenantId, tenantId))
      .orderBy(desc(socialAutoResponderRules.createdAt))
    return rows.map(r => this.mapRule(r))
  }

  async getEnabledRulesForPlatform(tenantId: string, platform: string): Promise<SocialAutoResponderRule[]> {
    const rows = await this.db
      .select()
      .from(socialAutoResponderRules)
      .where(and(
        eq(socialAutoResponderRules.tenantId, tenantId),
        eq(socialAutoResponderRules.isEnabled, true)
      ))
    return rows
      .filter(r => r.platform === 'ALL' || r.platform === platform)
      .map(r => this.mapRule(r))
  }

  async getRule(tenantId: string, id: string): Promise<SocialAutoResponderRule | null> {
    const [row] = await this.db
      .select()
      .from(socialAutoResponderRules)
      .where(and(eq(socialAutoResponderRules.tenantId, tenantId), eq(socialAutoResponderRules.id, id)))
    return row ? this.mapRule(row) : null
  }

  async saveRule(r: SocialAutoResponderRule): Promise<void> {
    await this.db.insert(socialAutoResponderRules).values({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      platform: r.platform,
      triggerKeywords: r.triggerKeywords,
      responseMode: r.responseMode,
      staticReplies: r.staticReplies,
      aiPrompt: r.aiPrompt,
      sendPrivateDm: r.sendPrivateDm,
      autoCreateLead: r.autoCreateLead,
      pipelineId: r.pipelineId,
      stageId: r.stageId,
      isEnabled: r.isEnabled,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }).onConflictDoUpdate({
      target: socialAutoResponderRules.id,
      set: {
        name: r.name,
        platform: r.platform,
        triggerKeywords: r.triggerKeywords,
        responseMode: r.responseMode,
        staticReplies: r.staticReplies,
        aiPrompt: r.aiPrompt,
        sendPrivateDm: r.sendPrivateDm,
        autoCreateLead: r.autoCreateLead,
        pipelineId: r.pipelineId,
        stageId: r.stageId,
        isEnabled: r.isEnabled,
        updatedAt: r.updatedAt,
      },
    })
  }

  async deleteRule(tenantId: string, id: string): Promise<void> {
    await this.db.delete(socialAutoResponderRules)
      .where(and(eq(socialAutoResponderRules.tenantId, tenantId), eq(socialAutoResponderRules.id, id)))
  }

  async autoCreateContact(tenantId: string, authorName: string, platform: string): Promise<void> {
    const [firstName, ...rest] = authorName.split(' ')
    await this.db.insert(contacts).values({
      id: crypto.randomUUID(),
      tenantId,
      firstName: firstName || 'Lead',
      lastName: rest.join(' ') || 'Social',
      email: `${(firstName || 'lead').toLowerCase()}_${Date.now()}@social-lead.com`,
      phone: '+18005550199',
      leadSource: `${platform} Comment Lead`,
      leadStatus: 'QUALIFIED',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing()
  }

  private mapComment(row: any): SocialComment {
    return new SocialComment(
      row.id, row.tenantId, row.platform, row.postType, row.postId, row.postTitle ?? undefined,
      row.authorId, row.authorName, row.authorAvatarUrl ?? undefined, row.commentId,
      row.parentCommentId ?? undefined, row.message, row.sentiment, row.status,
      row.replyMessage ?? undefined, row.repliedAt ?? undefined, row.repliedBy ?? undefined,
      row.createdAt, row.updatedAt
    )
  }

  private mapRule(row: any): SocialAutoResponderRule {
    return new SocialAutoResponderRule(
      row.id, row.tenantId, row.name, row.platform, row.triggerKeywords ?? [],
      row.responseMode, row.staticReplies ?? [], row.aiPrompt ?? undefined,
      row.sendPrivateDm, row.autoCreateLead, row.pipelineId ?? undefined,
      row.stageId ?? undefined, row.isEnabled, row.createdAt, row.updatedAt
    )
  }
}
