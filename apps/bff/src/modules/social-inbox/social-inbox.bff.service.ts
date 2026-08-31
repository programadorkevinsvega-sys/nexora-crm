import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, contacts, deals, pipelines, pipelineStages } from '@crm/database'
import { eq } from 'drizzle-orm'
import type {
  SocialComment,
  SocialAutoResponderRule,
  CreateSocialReplyDto,
  SimulateCommentDto,
  SocialPlatform,
} from '@crm/contracts'

import { RagService } from '../ai/rag/rag.service'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

// In-memory persistent state across requests
const commentsStore = new Map<string, SocialComment[]>()
const rulesStore = new Map<string, SocialAutoResponderRule[]>()

@Injectable()
export class SocialInboxBffService {
  private readonly logger = new Logger(SocialInboxBffService.name)

  constructor(private readonly ragService: RagService) {}

  private get db() { return getDb() }

  private getComments(tenantId: string): SocialComment[] {
    if (!commentsStore.has(tenantId)) {
      // Seed default sample comments
      commentsStore.set(tenantId, [
        {
          id: 'cm_001',
          tenantId,
          platform: 'INSTAGRAM',
          postType: 'REEL',
          postId: 'reel_98234',
          postTitle: 'Reel: 5 Pasos para Duplicar tus Ventas con Nexora CRM 🚀',
          authorId: 'ig_usr_123',
          authorName: 'Camila Restrepo',
          commentId: 'ig_cm_991',
          message: '¿Tienen planes para agencias o solo empresas grandes? Me interesa mucho.',
          sentiment: 'QUESTION',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 'cm_002',
          tenantId,
          platform: 'FACEBOOK',
          postType: 'AD_CREATIVE',
          postId: 'fb_ad_8871',
          postTitle: 'Anuncio: Automatiza WhatsApp, Pipelines y Facturación en 1 Clic',
          authorId: 'fb_usr_456',
          authorName: 'Andrés Morales',
          commentId: 'fb_cm_112',
          message: 'Precio por favor y si incluye integración con Shopify',
          sentiment: 'QUESTION',
          status: 'BOT_REPLIED',
          replyMessage: '¡Hola Andrés! Te hemos enviado un mensaje privado con el detalle de precios y compatibilidad con Shopify. 🚀',
          repliedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          repliedBy: 'AI_BOT',
          createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: 'cm_003',
          tenantId,
          platform: 'TIKTOK',
          postType: 'TIKTOK_VIDEO',
          postId: 'tk_vid_334',
          postTitle: 'Video: Cómo conectar WhatsApp Cloud API gratis 📲',
          authorId: 'tk_usr_789',
          authorName: 'Diego Torres',
          commentId: 'tk_cm_554',
          message: 'Excelente explicación, necesito soporte para configurarlo en mi empresa!',
          sentiment: 'POSITIVE',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
      ])
    }
    return commentsStore.get(tenantId)!
  }

  private getRules(tenantId: string): SocialAutoResponderRule[] {
    if (!rulesStore.has(tenantId)) {
      rulesStore.set(tenantId, [
        {
          id: 'rule_001',
          tenantId,
          name: 'Autorespuesta Inteligente de Precios & Info (Bot IA)',
          platform: 'ALL',
          triggerKeywords: ['precio', 'costo', 'info', 'informacion', 'cuanto vale', 'planes'],
          responseMode: 'AI_BOT',
          staticReplies: [],
          aiPrompt: 'Responde amablemente agradeciendo por el interés e indicando que le enviamos la propuesta por mensaje privado.',
          sendPrivateDm: true,
          autoCreateLead: true,
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rule_002',
          tenantId,
          name: 'Respuesta Rápida a Comentarios Positivos (Plantillas)',
          platform: 'ALL',
          triggerKeywords: ['excelente', 'genial', 'felicitaciones', 'buen video', 'top'],
          responseMode: 'STATIC_TEMPLATE',
          staticReplies: [
            '¡Muchas gracias {name}! Nos alegra mucho que te sea de gran utilidad 🚀✨',
            '¡Gracias por tu apoyo {name}! Seguimos creando contenido para potenciar tus ventas 🔥',
          ],
          sendPrivateDm: false,
          autoCreateLead: false,
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
    }
    return rulesStore.get(tenantId)!
  }

  async listComments(tenantId?: string, platform?: string, status?: string): Promise<SocialComment[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    let list = this.getComments(tid)
    if (platform && platform !== 'ALL') {
      list = list.filter((c) => c.platform === platform)
    }
    if (status && status !== 'ALL') {
      list = list.filter((c) => c.status === status)
    }
    return list
  }

  async replyComment(dto: CreateSocialReplyDto, tenantId?: string): Promise<SocialComment> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const list = this.getComments(tid)
    const target = list.find((c) => c.id === dto.commentId)
    if (!target) throw new NotFoundException('Comentario no encontrado')

    target.replyMessage = dto.replyMessage
    target.status = 'REPLIED'
    target.repliedAt = new Date().toISOString()
    target.repliedBy = 'AGENT'
    target.updatedAt = new Date().toISOString()

    this.logger.log(`Manual reply posted on ${target.platform} comment ${target.commentId}`)
    return target
  }

  async listRules(tenantId?: string): Promise<SocialAutoResponderRule[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    return this.getRules(tid)
  }

  async saveRule(dto: Partial<SocialAutoResponderRule>, tenantId?: string): Promise<SocialAutoResponderRule> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const rules = this.getRules(tid)
    const now = new Date().toISOString()

    if (dto.id) {
      const idx = rules.findIndex((r) => r.id === dto.id)
      if (idx !== -1) {
        rules[idx] = { ...rules[idx], ...dto, updatedAt: now } as SocialAutoResponderRule
        return rules[idx]
      }
    }

    const newRule: SocialAutoResponderRule = {
      id: `rule_${Date.now()}`,
      tenantId: tid,
      name: dto.name || 'Nueva Regla de Autorespuesta',
      platform: dto.platform || 'ALL',
      triggerKeywords: dto.triggerKeywords || [],
      responseMode: dto.responseMode || 'STATIC_TEMPLATE',
      staticReplies: dto.staticReplies || ['¡Hola {name}! Gracias por tu comentario 🚀'],
      aiPrompt: dto.aiPrompt,
      sendPrivateDm: dto.sendPrivateDm ?? false,
      autoCreateLead: dto.autoCreateLead ?? true,
      isEnabled: dto.isEnabled ?? true,
      createdAt: now,
      updatedAt: now,
    }

    rules.unshift(newRule)
    return newRule
  }

  async deleteRule(ruleId: string, tenantId?: string): Promise<{ success: boolean }> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const rules = this.getRules(tid)
    const filtered = rules.filter((r) => r.id !== ruleId)
    rulesStore.set(tid, filtered)
    return { success: true }
  }

  async simulateComment(dto: SimulateCommentDto, tenantId?: string): Promise<{
    comment: SocialComment
    matchedRule?: SocialAutoResponderRule | null
    autoReplied: boolean
  }> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const now = new Date()

    const newComment: SocialComment = {
      id: `cm_${Date.now()}`,
      tenantId: tid,
      platform: dto.platform,
      postType: dto.postType,
      postId: `post_${Date.now()}`,
      postTitle: dto.postTitle,
      authorId: `usr_${Date.now()}`,
      authorName: dto.authorName,
      commentId: `ext_cm_${Date.now()}`,
      message: dto.message,
      sentiment: dto.message.includes('?') ? 'QUESTION' : 'NEUTRAL',
      status: 'PENDING',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    // Evaluate rules
    const rules = this.getRules(tid).filter((r) => r.isEnabled && (r.platform === 'ALL' || r.platform === dto.platform))
    const msgLower = dto.message.toLowerCase()

    let matchedRule: SocialAutoResponderRule | null = null
    for (const rule of rules) {
      const match = rule.triggerKeywords.length === 0 || rule.triggerKeywords.some((k) => msgLower.includes(k.toLowerCase().trim()))
      if (match) {
        matchedRule = rule
        break
      }
    }

    if (matchedRule) {
      if (matchedRule.responseMode === 'AI_BOT') {
        const ragRes = await this.ragService.generateGroundedReply(tid, {
          query: dto.message,
          authorName: dto.authorName,
          platform: dto.platform,
          customPrompt: matchedRule.aiPrompt,
        })
        newComment.replyMessage = ragRes.replyText
        newComment.repliedBy = 'AI_BOT'
      } else {
        const pool = matchedRule.staticReplies.length > 0 ? matchedRule.staticReplies : ['¡Hola {name}! Gracias por tu mensaje.']
        const randomTemplate = pool[Math.floor(Math.random() * pool.length)]
        newComment.replyMessage = randomTemplate.replace(/\{name\}/g, dto.authorName)
        newComment.repliedBy = 'AUTO_RULE'
      }

      newComment.status = 'BOT_REPLIED'
      newComment.repliedAt = now.toISOString()

      // Auto-create lead
      if (matchedRule.autoCreateLead) {
        const contactId = crypto.randomUUID()
        const [firstName, ...rest] = dto.authorName.split(' ')
        await this.db.insert(contacts).values({
          id: contactId,
          tenantId: tid,
          firstName: firstName || 'Lead',
          lastName: rest.join(' ') || 'Social',
          email: `${firstName.toLowerCase()}_${Date.now()}@social-lead.com`,
          phone: '+18005550199',
          leadSource: `${dto.platform} Comment Lead`,
          leadStatus: 'QUALIFIED',
          createdAt: now,
          updatedAt: now,
        }).onConflictDoNothing()
      }
    }

    const comments = this.getComments(tid)
    comments.unshift(newComment)

    return {
      comment: newComment,
      matchedRule,
      autoReplied: !!newComment.replyMessage,
    }
  }
}
