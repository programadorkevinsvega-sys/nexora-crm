export { companies } from './schema/001-core/companies'
export { contacts } from './schema/001-core/contacts'
export { addresses } from './schema/001-core/addresses'
export { pipelines, pipelineStages } from './schema/001-core/pipelines'
export { deals } from './schema/001-core/deals'
export { notes, tasks, calls } from './schema/001-core/interactions'
export { tags, contactTags } from './schema/001-core/tags'
export { supportTickets } from './schema/001-core/support-tickets'

export {
  contactRelationships, campaigns, campaignMembers, dealLineItems,
  quotes, emails, whatsappMessages, meetings, documentLinks,
  ticketReplies, fieldHistoryLogs,
} from './schema/002-advanced/advanced'

export {
  salesTeams, salesTeamMembers, salesQuotas, lostReasons,
  competitors, dealCompetitors, contracts, slas, partners,
} from './schema/003-enterprise/enterprise'

export {
  affiliatePrograms, affiliates, affiliateCommissions, affiliatePayouts,
  crmPartners, partnerDealRegistrations,
} from './schema/005-affiliates/affiliates'

export {
  helpdeskMailboxes, helpdeskMailboxUsers, helpdeskConversations,
  helpdeskFollowers, helpdeskThreads, helpdeskAttachments,
} from './schema/006-helpdesk-inbox/helpdesk-inbox'

export {
  relationshipTypes, contactRelationships as personalContactRelationships,
  lifeEvents, contactGifts, contactDebts, contactReminders,
} from './schema/007-personal-crm/personal-crm'

export {
  contactNotes, activities, activityContacts, callLogs,
  contactTasks, contactPets,
} from './schema/008-activities/activities'

export {
  loyaltyProfiles, customerSegments, segmentAssignments,
  productPreferences, customerMetrics,
} from './schema/009-loyalty/loyalty'

export {
  helpdeskFolders, helpdeskConversationFolders, helpdeskCustomerEmails,
  helpdeskSendLogs, helpdeskSubscriptions,
} from './schema/010-helpdesk-advanced/helpdesk-advanced'

export {
  ticketStatuses, ticketPriorities, ticketCategories,
  agentProfiles, ticketAudits,
} from './schema/011-helpdesk-itsm/helpdesk-itsm'

export {
  mfaMethods, mfaRecoveryCodes, sessions, ipRestrictions,
  oauthProviders, passwordPolicies, passwordHistory,
} from './schema/auth/auth'

export {
  authOutboxEvents, authEventDeadLetters, authInboxEvents,
} from './schema/auth/auth-outbox'

export {
  users, naturalPersonProfiles, legalEntityProfiles,
  userOauthLinks, userMobileDevices,
} from './schema/users/users'

export {
  usersOutboxEvents, usersEventDeadLetters, usersInboxEvents,
} from './schema/users/users-outbox'

export {
  roles, permissions, rolePermissions, userRoles,
} from './schema/iam/iam'

export {
  iamOutboxEvents, iamEventDeadLetters, iamInboxEvents,
} from './schema/iam/iam-outbox'

export {
  tenants, branches, tenantBranding, tenantSaaSSnapshot,
  tenantFeatures, tenantUsageMetrics, tenantDomains,
} from './schema/tenants/tenants'

export {
  systemModules, installedModules, tenantTaxConfigurations,
  globalSystemParameters,
} from './schema/tenants/tenant-modules'

export {
  tenantLanguages, tenantTranslations, tenantCurrencies,
  tenantExchangeRates, tenantApiKeys, tenantWebhooks,
  tenantWebhookEvents, tenantWebhookDeliveryLogs,
  tenantSystemAuditLogs,
} from './schema/tenants/tenant-config'

export {
  tenantOutboxEvents, tenantEventDeadLetters, tenantInboxEvents,
} from './schema/tenants/tenant-outbox'

export {
  notificationChannels, notificationTemplates, notificationQueue,
  notificationLogs, notificationPreferences,
} from './schema/notifications/notifications'

export {
  notificationOutboxEvents, notificationEventDeadLetters, notificationInboxEvents,
} from './schema/notifications/notifications-outbox'

export { auditLogs } from './schema/audit/audit'

export {
  auditOutboxEvents, auditEventDeadLetters, auditInboxEvents,
} from './schema/audit/audit'

export { files } from './schema/storage/storage'

export {
  storageOutboxEvents, storageEventDeadLetters, storageInboxEvents,
} from './schema/storage/storage'

export {
  scheduledTasks, taskExecutions, reminders, slaConfigs, slaViolations,
} from './schema/scheduler/scheduler'

export {
  schedulerOutboxEvents, schedulerEventDeadLetters, schedulerInboxEvents,
} from './schema/scheduler/scheduler'

export {
  workflowDefinitions, workflowExecutions, workflowStepExecutions,
} from './schema/012-automation/automation'

export {
  leadScoringRules, leadScores,
} from './schema/013-scoring/scoring'

export {
  products, quoteApprovals, eSignatures, productTemplates,
} from './schema/014-cpq/cpq'

export {
  knowledgeBaseCategories, knowledgeBaseArticles,
} from './schema/015-knowledge-base/knowledge-base'

export {
  aiDealPredictions, aiGeneratedDrafts,
} from './schema/016-ai/ai'

export {
  apiKeys, webhookEndpoints, webhookDeliveryLogs,
} from './schema/017-developer/developer'

export { outboxEvents } from './schema/099-outbox/outbox-events'
export { getDb } from './db'
export type { DrizzleDb } from './db'
