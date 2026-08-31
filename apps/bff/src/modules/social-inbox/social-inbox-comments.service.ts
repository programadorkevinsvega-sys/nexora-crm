import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  getDb, socialComments, socialAutoResponderRules, contacts,
} from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type { SocialComment, SocialAutoResponderRule, CreateSocialReplyDto } from '@crm/contracts'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class SocialInboxCommentsService {
  private readonly logger = new Logger(SocialInboxCommentsService.name)

  private get db() { return getDb() }

  async listComments(tenantId?: string, platform?: string, status?: string): Promise<SocialComment[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const conditions = [eq(socialComments.tenantId, tid)]
    if (platform && platform !== 'ALL') {
      conditions.push(eq(socialComments.platform, platform))
    }
    if (status && status !== 'ALL') {
      conditions.push(eq(socialComments.status, status))
    }

    const rows = await this.db
      .select()
      .from(socialComments)
      .where(and(...conditions))
      .orderBy(desc(socialComments.createdAt))
      .limit(100)

    return rows.map(this.toDto)
  }

  async replyComment(dto: CreateSocialReplyDto, tenantId?: string): Promise<SocialComment> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const now = new Date()
    const [updated] = await this.db
      .update(socialComments)
      .set({
        replyMessage: dto.replyMessage,
        status: 'REPLIED',
        repliedAt: now,
        repliedBy: 'AGENT',
        updatedAt: now,
      })
      .where(and(eq(socialComments.id, dto.commentId), eq(socialComments.tenantId, tid)))
      .returning()
    if (!updated) throw new NotFoundException('Comentario no encontrado')
    this.logger.log(`Agent replied to comment ${dto.commentId} on ${updated.platform}`)
    return this.toDto(updated)
  }

  async insertComment(data: {
    tenantId: string
    platform: string
    postType: string
    postId: string
    postTitle?: string
    authorId: string
    authorName: string
    commentId: string
    message: string
    sentiment?: string
    status?: string
    replyMessage?: string
    repliedAt?: Date
    repliedBy?: string
  }): Promise<SocialComment> {
    const now = new Date()
    const [row] = await this.db.insert(socialComments).values({
      ...data,
      sentiment: data.sentiment || 'NEUTRAL',
      status: data.status || 'PENDING',
      createdAt: now,
      updatedAt: now,
    }).returning()
    return this.toDto(row)
  }

  async updateCommentBot(
    commentId: string, tenantId: string,
    replyMessage: string, repliedBy: string, repliedAt: Date,
  ): Promise<SocialComment> {
    const [row] = await this.db
      .update(socialComments)
      .set({ replyMessage, repliedBy, repliedAt, status: 'BOT_REPLIED', updatedAt: new Date() })
      .where(and(eq(socialComments.id, commentId), eq(socialComments.tenantId, tenantId)))
      .returning()
    return this.toDto(row)
  }

  async autoCreateContact(authorName: string, platform: string, tenantId: string): Promise<void> {
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

  private toDto(row: typeof socialComments.$inferSelect): SocialComment {
    return {
      id: row.id,
      tenantId: row.tenantId,
      platform: row.platform as SocialComment['platform'],
      postType: row.postType as SocialComment['postType'],
      postId: row.postId,
      postTitle: row.postTitle ?? undefined,
      authorId: row.authorId,
      authorName: row.authorName,
      authorAvatarUrl: row.authorAvatarUrl ?? undefined,
      commentId: row.commentId,
      parentCommentId: row.parentCommentId ?? undefined,
      message: row.message,
      sentiment: (row.sentiment ?? 'NEUTRAL') as SocialComment['sentiment'],
      status: (row.status ?? 'PENDING') as SocialComment['status'],
      replyMessage: row.replyMessage ?? undefined,
      repliedAt: row.repliedAt?.toISOString(),
      repliedBy: row.repliedBy as SocialComment['repliedBy'],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }
  }
}
