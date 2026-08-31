import { SocialComment } from '../entities/social-comment.entity'
import { SocialAutoResponderRule } from '../entities/social-rule.entity'

export interface SocialInboxRepository {
  // Comments
  listComments(tenantId: string, platform?: string, status?: string): Promise<SocialComment[]>
  getComment(tenantId: string, id: string): Promise<SocialComment | null>
  saveComment(comment: SocialComment): Promise<void>

  // Rules
  listRules(tenantId: string): Promise<SocialAutoResponderRule[]>
  getEnabledRulesForPlatform(tenantId: string, platform: string): Promise<SocialAutoResponderRule[]>
  getRule(tenantId: string, id: string): Promise<SocialAutoResponderRule | null>
  saveRule(rule: SocialAutoResponderRule): Promise<void>
  deleteRule(tenantId: string, id: string): Promise<void>

  // Contacts
  autoCreateContact(tenantId: string, authorName: string, platform: string): Promise<void>
}
