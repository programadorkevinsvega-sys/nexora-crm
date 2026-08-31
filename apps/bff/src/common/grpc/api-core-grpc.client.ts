import { Injectable, Inject, OnModuleInit } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { Observable, lastValueFrom } from 'rxjs'
import type { Company, Tag } from '@crm/contracts'
import type { Contact } from '@crm/contracts'
import type { Pipeline, PipelineBoard, Deal } from '@crm/contracts'
import type { Note } from '@crm/contracts'
import type { Task } from '@crm/contracts'
import type { Call } from '@crm/contracts'
import type { SupportTicket } from '@crm/contracts'
import type { TicketReply } from '@crm/contracts'
import type { Campaign } from '@crm/contracts'
import type { CampaignMember } from '@crm/contracts'
import type { Quote } from '@crm/contracts'
import type { Contract } from '@crm/contracts'
import type { SalesTeam } from '@crm/contracts'
import type { SalesQuota } from '@crm/contracts'
import type {
  AffiliateProgram, Affiliate, AffiliateCommission, AffiliatePayout,
  HelpdeskConversation, HelpdeskThread, HelpdeskMailbox,
  CustomerSegment,
  LifeEvent, Gift, Debt, Reminder, Pet,
  WorkflowDefinition, WorkflowExecution, WorkflowStep,
  LeadScoringRule, LeadScore, ScoringRuleCategory, ScoringCondition,
  Product, ProductTemplate, QuoteApproval, ESignature, ProductPricingType,
  Customer360Profile, InboxConversation, InboxMessage, InboxChannel, InboxConversationStatus,
  RevenueMetrics, FunnelMetrics, CohortMetrics, RevenueForecast,
  KnowledgeBaseCategory, KnowledgeBaseArticle, CustomerPortalOverview,
  DealWinProbability, GeneratedMessageDraft, ContactExecutiveSummary, ChurnRiskPrediction,
  ApiKey, CreatedApiKey, CreateApiKey, WebhookEndpoint, CreateWebhookEndpoint, WebhookDeliveryLog,
} from '@crm/contracts'

interface DeveloperGrpc {
  createApiKey: (data: unknown) => Observable<{ json: string }>
  getApiKeys: (data: { tenantId: string }) => Observable<{ json: string }>
  revokeApiKey: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  deleteApiKey: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  validateApiKey: (data: { rawKey: string }) => Observable<{ valid: boolean; tenantId: string; scopes: string[]; keyId: string }>
  createWebhookEndpoint: (data: unknown) => Observable<{ json: string }>
  getWebhookEndpoints: (data: { tenantId: string }) => Observable<{ json: string }>
  deleteWebhookEndpoint: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  getDeliveryLogs: (data: { tenantId: string; endpointId: string }) => Observable<{ json: string }>
  dispatchWebhookEvent: (data: unknown) => Observable<{ json: string }>
}

interface Customer360Grpc {
  getCustomer360: (data: { tenantId: string; contactId: string }) => Observable<{ json: string }>
}

interface InboxGrpc {
  listConversations: (data: { tenantId: string; channel?: string; status?: string }) => Observable<{ jsonItems: string[] }>
  getConversation: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  sendMessage: (data: unknown) => Observable<{ json: string }>
}

interface AnalyticsGrpc {
  getRevenueMetrics: (data: { tenantId: string }) => Observable<{ json: string }>
  getFunnelMetrics: (data: { tenantId: string }) => Observable<{ json: string }>
  getCohortMetrics: (data: { tenantId: string }) => Observable<{ json: string }>
  getForecast: (data: { tenantId: string; horizon?: string }) => Observable<{ json: string }>
}

interface KnowledgeBaseGrpc {
  listCategories: (data: { tenantId: string }) => Observable<{ jsonItems: string[] }>
  createCategory: (data: unknown) => Observable<{ json: string }>
  listArticles: (data: { tenantId: string; categoryId?: string; query?: string; publicOnly?: boolean }) => Observable<{ jsonItems: string[] }>
  getArticle: (data: { tenantId: string; idOrSlug: string }) => Observable<{ json: string }>
  createArticle: (data: unknown) => Observable<{ json: string }>
  voteArticle: (data: { tenantId: string; articleId: string; isHelpful: boolean }) => Observable<{ json: string }>
  getPortalOverview: (data: { tenantId: string; contactId: string }) => Observable<{ json: string }>
}

interface AiGrpc {
  getDealWinProbability: (data: { tenantId: string; dealId: string }) => Observable<{ json: string }>
  generateMessageDraft: (data: unknown) => Observable<{ json: string }>
  getContactExecutiveSummary: (data: { tenantId: string; contactId: string }) => Observable<{ json: string }>
  getChurnRiskPrediction: (data: { tenantId: string; contactId: string }) => Observable<{ json: string }>
}

interface CpqGrpc {
  createProduct: (data: unknown) => Observable<{ json: string }>
  updateProduct: (data: unknown) => Observable<{ json: string }>
  deleteProduct: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  getProduct: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listProducts: (data: { tenantId: string }) => Observable<{ jsonItems: string[] }>
  createProductTemplate: (data: unknown) => Observable<{ json: string }>
  listProductTemplates: (data: { tenantId: string }) => Observable<{ jsonItems: string[] }>
  deleteProductTemplate: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  requestQuoteApproval: (data: unknown) => Observable<{ json: string }>
  decideQuoteApproval: (data: unknown) => Observable<{ json: string }>
  listPendingApprovals: (data: { tenantId: string }) => Observable<{ jsonItems: string[] }>
  initiateSignature: (data: unknown) => Observable<{ json: string }>
  verifySignatureOtp: (data: { token: string; otpCode: string }) => Observable<Record<string, never>>
  submitSignature: (data: unknown) => Observable<{ json: string }>
  getSignatureByToken: (data: { token: string }) => Observable<{ json: string }>
}

interface LeadScoringGrpc {
  createScoringRule: (data: unknown) => Observable<{ json: string }>
  toggleRuleStatus: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listScoringRules: (data: { tenantId: string }) => Observable<{ jsonItems: string[] }>
  getLeadScore: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  recalculateLeadScore: (data: unknown) => Observable<{ json: string }>
  adjustLeadScore: (data: unknown) => Observable<{ json: string }>
  applyScoreDecay: (data: unknown) => Observable<{ json: string }>
  listTopLeads: (data: { tenantId: string; limit?: number }) => Observable<{ jsonItems: string[] }>
}

interface AutomationGrpc {
  createWorkflow: (data: unknown) => Observable<{ json: string }>
  getWorkflow: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listWorkflows: (data: { tenantId: string; status?: string }) => Observable<{ jsonItems: string[] }>
  activateWorkflow: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  pauseWorkflow: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  triggerEvent: (data: unknown) => Observable<{ json: string }>
  getWorkflowExecution: (data: { tenantId: string; executionId: string }) => Observable<{ json: string; stepsJson: string[] }>
  listWorkflowExecutions: (data: unknown) => Observable<{ jsonItems: string[] }>
  cancelExecution: (data: { tenantId: string; executionId: string; reason?: string }) => Observable<Record<string, never>>
}

interface CompanyGrpc {
  createCompany: (data: unknown) => Observable<{ json: string }>
  getCompany: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listCompanies: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateCompany: (data: unknown) => Observable<Record<string, never>>
  deleteCompany: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
}

interface ContactGrpc {
  createContact: (data: unknown) => Observable<{ json: string }>
  getContact: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listContacts: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateContact: (data: unknown) => Observable<Record<string, never>>
  deleteContact: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
}

interface PipelineGrpc {
  createPipeline: (data: unknown) => Observable<{ json: string }>
  listPipelines: (data: { tenantId: string }) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  getPipelineBoard: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  updatePipeline: (data: unknown) => Observable<Record<string, never>>
  deletePipeline: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  createStage: (data: unknown) => Observable<{ json: string }>
  reorderStages: (data: unknown) => Observable<{ jsonItems: string[] }>
  createDeal: (data: unknown) => Observable<{ json: string }>
  getDeal: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listDeals: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateDeal: (data: unknown) => Observable<Record<string, never>>
  moveDeal: (data: unknown) => Observable<{ json: string }>
  winDeal: (data: unknown) => Observable<{ json: string }>
  loseDeal: (data: unknown) => Observable<{ json: string }>
  deleteDeal: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
}

interface InteractionGrpc {
  createNote: (data: unknown) => Observable<{ json: string }>
  getNote: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listNotes: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateNote: (data: unknown) => Observable<Record<string, never>>
  deleteNote: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  createTask: (data: unknown) => Observable<{ json: string }>
  getTask: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listTasks: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateTask: (data: unknown) => Observable<Record<string, never>>
  deleteTask: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  createCall: (data: unknown) => Observable<{ json: string }>
  getCall: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listCalls: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
}

interface SupportTicketGrpc {
  createTicket: (data: unknown) => Observable<{ json: string }>
  getTicket: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listTickets: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateTicketStatus: (data: unknown) => Observable<Record<string, never>>
  assignTicket: (data: unknown) => Observable<Record<string, never>>
  addTicketReply: (data: unknown) => Observable<{ json: string }>
  getTicketReplies: (data: { tenantId: string; id: string }) => Observable<{ jsonItems: string[]; nextCursor?: string }>
}

interface CampaignGrpc {
  createCampaign: (data: unknown) => Observable<{ json: string }>
  getCampaign: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listCampaigns: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateCampaign: (data: unknown) => Observable<Record<string, never>>
  updateCampaignStatus: (data: unknown) => Observable<Record<string, never>>
  deleteCampaign: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  listMembers: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  addMember: (data: unknown) => Observable<{ json: string }>
  updateMemberStatus: (data: unknown) => Observable<Record<string, never>>
}

interface QuoteGrpc {
  createQuote: (data: unknown) => Observable<{ json: string }>
  getQuote: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listQuotes: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  sendQuote: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  acceptQuote: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  rejectQuote: (data: unknown) => Observable<Record<string, never>>
}

interface ContractGrpc {
  createContract: (data: unknown) => Observable<{ json: string }>
  getContract: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listContracts: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateContract: (data: unknown) => Observable<Record<string, never>>
  renew: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  updateContractStatus: (data: unknown) => Observable<Record<string, never>>
}

interface SalesTeamGrpc {
  createTeam: (data: unknown) => Observable<{ json: string }>
  getTeam: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listTeams: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateTeam: (data: unknown) => Observable<Record<string, never>>
  deleteTeam: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  addMember: (data: unknown) => Observable<Record<string, never>>
  removeMember: (data: unknown) => Observable<Record<string, never>>
  listMembers: (data: { tenantId: string; id: string }) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  setQuota: (data: unknown) => Observable<{ json: string }>
  getQuota: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listQuotas: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateAchieved: (data: unknown) => Observable<Record<string, never>>
}

interface HelpdeskGrpc {
  createConversation: (data: unknown) => Observable<{ json: string }>
  getConversation: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listConversations: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  assignConversation: (data: unknown) => Observable<Record<string, never>>
  changeConversationStatus: (data: unknown) => Observable<Record<string, never>>
  resolveConversation: (data: unknown) => Observable<Record<string, never>>
  listThreads: (data: { tenantId: string; id: string }) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  addThread: (data: unknown) => Observable<{ json: string }>
  listMailboxes: (data: { tenantId: string }) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  createMailbox: (data: unknown) => Observable<{ json: string }>
  getAgentProfile: (data: { tenantId: string }) => Observable<{ json: string }>
  updateAgentAvailability: (data: unknown) => Observable<Record<string, never>>
}

interface AffiliateGrpc {
  createProgram: (data: unknown) => Observable<{ json: string }>
  getProgram: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listPrograms: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  updateProgram: (data: unknown) => Observable<Record<string, never>>
  registerAffiliate: (data: unknown) => Observable<{ json: string }>
  getAffiliate: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  listAffiliates: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  recordCommission: (data: unknown) => Observable<{ json: string }>
  listCommissions: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  processPayout: (data: unknown) => Observable<{ json: string }>
  listPayouts: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
}

interface PersonalCrmGrpc {
  createLifeEvent: (data: unknown) => Observable<{ json: string }>
  listLifeEvents: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  createGift: (data: unknown) => Observable<{ json: string }>
  listGifts: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  createDebt: (data: unknown) => Observable<{ json: string }>
  listDebts: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  settleDebt: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  createReminder: (data: unknown) => Observable<{ json: string }>
  listReminders: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  toggleReminder: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
  addPet: (data: unknown) => Observable<{ json: string }>
  listPets: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
}

interface LoyaltyGrpc {
  getProfile: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  earnPoints: (data: unknown) => Observable<{ json: string }>
  redeemPoints: (data: unknown) => Observable<{ json: string }>
  listSegments: (data: { tenantId: string }) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  createSegment: (data: unknown) => Observable<{ json: string }>
  assignToSegment: (data: unknown) => Observable<Record<string, never>>
  getMetrics: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
}

interface TagGrpc {
  createTag: (data: unknown) => Observable<{ json: string }>
  getTag: (data: { tenantId: string; id: string }) => Observable<{ json: string }>
  updateTag: (data: unknown) => Observable<Record<string, never>>
  listTags: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  deleteTag: (data: { tenantId: string; id: string }) => Observable<Record<string, never>>
}

interface AuditGrpc {
  listAuditLogs: (data: unknown) => Observable<{ jsonItems: string[]; nextCursor?: string }>
  getAuditStats: (data: unknown) => Observable<{ json: string }>
  createAuditLog: (data: unknown) => Observable<{ json: string }>
}

interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

@Injectable()
export class ApiCoreGrpcClient implements OnModuleInit {
  private companies!: CompanyGrpc
  private contacts!: ContactGrpc
  private pipelines!: PipelineGrpc
  private interactions!: InteractionGrpc
  private supportTickets!: SupportTicketGrpc
  private campaigns!: CampaignGrpc
  private quotes!: QuoteGrpc
  private contracts!: ContractGrpc
  private salesTeams!: SalesTeamGrpc
  private helpdesk!: HelpdeskGrpc
  private affiliates!: AffiliateGrpc
  private personalCrm!: PersonalCrmGrpc
  private loyalty!: LoyaltyGrpc
  private tags!: TagGrpc
  private automation!: AutomationGrpc
  private leadScoring!: LeadScoringGrpc
  private cpq!: CpqGrpc
  private customer360!: Customer360Grpc
  private inbox!: InboxGrpc
  private analytics!: AnalyticsGrpc
  private knowledgeBase!: KnowledgeBaseGrpc
  private ai!: AiGrpc
  private developer!: DeveloperGrpc
  private audit!: AuditGrpc

  constructor(@Inject('API_CORE_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.companies = this.client.getService<CompanyGrpc>('CompanyService')
    this.contacts = this.client.getService<ContactGrpc>('ContactService')
    this.pipelines = this.client.getService<PipelineGrpc>('PipelineService')
    this.interactions = this.client.getService<InteractionGrpc>('InteractionService')
    this.supportTickets = this.client.getService<SupportTicketGrpc>('SupportTicketService')
    this.campaigns = this.client.getService<CampaignGrpc>('CampaignService')
    this.quotes = this.client.getService<QuoteGrpc>('QuoteService')
    this.contracts = this.client.getService<ContractGrpc>('ContractService')
    this.salesTeams = this.client.getService<SalesTeamGrpc>('SalesTeamService')
    this.helpdesk = this.client.getService<HelpdeskGrpc>('HelpdeskService')
    this.affiliates = this.client.getService<AffiliateGrpc>('AffiliateService')
    this.personalCrm = this.client.getService<PersonalCrmGrpc>('PersonalCrmService')
    this.loyalty = this.client.getService<LoyaltyGrpc>('LoyaltyService')
    this.tags = this.client.getService<TagGrpc>('TagService')
    this.automation = this.client.getService<AutomationGrpc>('AutomationService')
    this.leadScoring = this.client.getService<LeadScoringGrpc>('LeadScoringService')
    this.cpq = this.client.getService<CpqGrpc>('CpqService')
    this.customer360 = this.client.getService<Customer360Grpc>('Customer360Service')
    this.inbox = this.client.getService<InboxGrpc>('InboxService')
    this.analytics = this.client.getService<AnalyticsGrpc>('AnalyticsService')
    this.knowledgeBase = this.client.getService<KnowledgeBaseGrpc>('KnowledgeBaseService')
    this.ai = this.client.getService<AiGrpc>('AiService')
    this.developer = this.client.getService<DeveloperGrpc>('DeveloperService')
    this.audit = this.client.getService<AuditGrpc>('AuditService')
  }

  // ─── Companies ──────────────────────────────────────────

  async createCompany(dto: {
    tenantId: string
    name: string
    taxId?: string | null
    website?: string | null
    industry?: string | null
    numberOfEmployees?: number | null
    annualRevenue?: number | null
    description?: string | null
    parentCompanyId?: string | null
  }): Promise<Company> {
    const res = await lastValueFrom(this.companies.createCompany(dto))
    return JSON.parse(res.json)
  }

  async getCompany(tenantId: string, id: string): Promise<Company> {
    const res = await lastValueFrom(this.companies.getCompany({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listCompanies(data: {
    tenantId: string
    cursor?: string
    limit?: number
    search?: string
    industry?: string
  }): Promise<PaginatedResult<Company>> {
    const res = await lastValueFrom(this.companies.listCompanies(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateCompany(data: {
    tenantId: string
    id: string
    name?: string
    taxId?: string | null
    website?: string | null
    industry?: string | null
    numberOfEmployees?: number | null
    annualRevenue?: number | null
    description?: string | null
    parentCompanyId?: string | null
  }): Promise<void> {
    await lastValueFrom(this.companies.updateCompany(data))
  }

  async deleteCompany(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.companies.deleteCompany({ tenantId, id }))
  }

  // ─── Contacts ────────────────────────────────────────────

  async createContact(dto: {
    tenantId: string
    firstName: string
    lastName?: string | null
    email?: string | null
    phone?: string | null
    companyId?: string | null
    jobTitle?: string | null
    leadSource?: string | null
    leadStatus?: string | null
    identificationType?: string | null
    identificationNumber?: string | null
    verificationDigit?: string | null
    birthDate?: string | null
    streetAddress?: string | null
    city?: string | null
    stateProvince?: string | null
    postalCode?: string | null
    country?: string | null
    nickname?: string | null
    gender?: string | null
    isStarred?: boolean | null
    isDeceased?: boolean | null
    stayInTouchFrequencyDays?: number | null
    taxRegime?: string | null
    isTaxLiable?: boolean | null
    loyaltyPoints?: number | null
    avatarUrl?: string | null
    lastTalkedToAt?: string | null
    metadata?: Record<string, unknown> | null
  }): Promise<Contact> {
    const res = await lastValueFrom(this.contacts.createContact({
      tenantId: dto.tenantId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      companyId: dto.companyId,
      jobTitle: dto.jobTitle,
      leadSource: dto.leadSource,
      leadStatus: dto.leadStatus,
      identificationType: dto.identificationType,
      identificationNumber: dto.identificationNumber,
      verificationDigit: dto.verificationDigit,
      birthDate: dto.birthDate,
      streetAddress: dto.streetAddress,
      city: dto.city,
      stateProvince: dto.stateProvince,
      postalCode: dto.postalCode,
      country: dto.country,
      nickname: dto.nickname,
      gender: dto.gender,
      isStarred: dto.isStarred,
      isDeceased: dto.isDeceased,
      stayInTouchFrequencyDays: dto.stayInTouchFrequencyDays,
      taxRegime: dto.taxRegime,
      isTaxLiable: dto.isTaxLiable,
      loyaltyPoints: dto.loyaltyPoints,
      avatarUrl: dto.avatarUrl,
      lastTalkedToAt: dto.lastTalkedToAt,
      metadata: dto.metadata,
    }))
    return JSON.parse(res.json)
  }

  async getContact(tenantId: string, id: string): Promise<Contact> {
    const res = await lastValueFrom(this.contacts.getContact({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listContacts(data: {
    tenantId: string
    cursor?: string
    limit?: number
    search?: string
    leadStatus?: string
    companyId?: string
    isStarred?: boolean
  }): Promise<PaginatedResult<Contact>> {
    const res = await lastValueFrom(this.contacts.listContacts(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateContact(data: {
    tenantId: string
    id: string
    firstName?: string
    lastName?: string | null
    email?: string | null
    phone?: string | null
    companyId?: string | null
    jobTitle?: string | null
    leadSource?: string | null
    leadStatus?: string | null
    identificationType?: string | null
    identificationNumber?: string | null
    verificationDigit?: string | null
    birthDate?: string | null
    streetAddress?: string | null
    city?: string | null
    stateProvince?: string | null
    postalCode?: string | null
    country?: string | null
    nickname?: string | null
    gender?: string | null
    isStarred?: boolean | null
    isDeceased?: boolean | null
    stayInTouchFrequencyDays?: number | null
    taxRegime?: string | null
    isTaxLiable?: boolean | null
    loyaltyPoints?: number | null
    avatarUrl?: string | null
    lastTalkedToAt?: string | null
    metadata?: Record<string, unknown> | null
  }): Promise<void> {
    await lastValueFrom(this.contacts.updateContact(data))
  }

  async deleteContact(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.contacts.deleteContact({ tenantId, id }))
  }

  // ─── Pipelines & Deals ───────────────────────────────────

  async createPipeline(tenantId: string, name: string): Promise<Pipeline> {
    const res = await lastValueFrom(this.pipelines.createPipeline({ tenantId, name }))
    return JSON.parse(res.json)
  }

  async listPipelines(tenantId: string): Promise<Pipeline[]> {
    const res = await lastValueFrom(this.pipelines.listPipelines({ tenantId }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async getPipelineBoard(tenantId: string, id: string): Promise<PipelineBoard> {
    const res = await lastValueFrom(this.pipelines.getPipelineBoard({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async updatePipeline(tenantId: string, id: string, dto: Partial<{ name: string }>): Promise<void> {
    await lastValueFrom(this.pipelines.updatePipeline({ tenantId, id, ...dto }))
  }

  async deletePipeline(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.pipelines.deletePipeline({ tenantId, id }))
  }

  async createStage(data: {
    tenantId: string
    pipelineId: string
    name: string
    displayOrder: number
    probabilityPercent?: number
  }): Promise<PipelineBoard> {
    const res = await lastValueFrom(this.pipelines.createStage(data))
    return JSON.parse(res.json)
  }

  async reorderStages(tenantId: string, pipelineId: string, stageIds: string[]): Promise<PipelineBoard[]> {
    const res = await lastValueFrom(this.pipelines.reorderStages({ tenantId, pipelineId, stageIds }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async listDeals(data: {
    tenantId: string
    pipelineId?: string
    stageId?: string
    status?: string
    contactId?: string
    companyId?: string
    assignedUserId?: string
    search?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Deal>> {
    const res = await lastValueFrom(this.pipelines.listDeals(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async createDeal(data: {
    tenantId: string
    pipelineId: string
    stageId: string
    contactId?: string | null
    companyId?: string | null
    name: string
    amount?: number
    expectedCloseDate?: string | null
    assignedUserId?: string | null
  }): Promise<Deal> {
    const res = await lastValueFrom(this.pipelines.createDeal(data))
    return JSON.parse(res.json)
  }

  async getDeal(tenantId: string, id: string): Promise<Deal> {
    const res = await lastValueFrom(this.pipelines.getDeal({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async updateDeal(data: {
    tenantId: string
    id: string
    name?: string
    amount?: number
    stageId?: string
    expectedCloseDate?: string | null
    assignedUserId?: string | null
  }): Promise<void> {
    await lastValueFrom(this.pipelines.updateDeal(data))
  }

  async moveDeal(tenantId: string, id: string, stageId: string): Promise<Deal> {
    const res = await lastValueFrom(this.pipelines.moveDeal({ tenantId, id, stageId }))
    return JSON.parse(res.json)
  }

  async winDeal(tenantId: string, id: string, amount?: number): Promise<Deal> {
    const res = await lastValueFrom(this.pipelines.winDeal({ tenantId, id, amount }))
    return JSON.parse(res.json)
  }

  async loseDeal(tenantId: string, id: string, lostReasonId?: string, lostNotes?: string): Promise<Deal> {
    const res = await lastValueFrom(this.pipelines.loseDeal({ tenantId, id, lostReasonId, lostNotes }))
    return JSON.parse(res.json)
  }

  async deleteDeal(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.pipelines.deleteDeal({ tenantId, id }))
  }

  // ─── Interactions (Notes, Tasks, Calls) ──────────────────

  async createNote(dto: {
    tenantId: string
    contactId?: string | null
    companyId?: string | null
    dealId?: string | null
    content: string
  }): Promise<Note> {
    const res = await lastValueFrom(this.interactions.createNote(dto))
    return JSON.parse(res.json)
  }

  async getNote(tenantId: string, id: string): Promise<Note> {
    const res = await lastValueFrom(this.interactions.getNote({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listNotes(data: {
    tenantId: string
    contactId?: string
    companyId?: string
    dealId?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Note>> {
    const res = await lastValueFrom(this.interactions.listNotes(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateNote(data: { tenantId: string; id: string; content: string }): Promise<void> {
    await lastValueFrom(this.interactions.updateNote(data))
  }

  async deleteNote(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.interactions.deleteNote({ tenantId, id }))
  }

  async createTask(dto: {
    tenantId: string
    contactId?: string | null
    companyId?: string | null
    dealId?: string | null
    title: string
    description?: string | null
    dueDate: string
    assignedUserId?: string | null
  }): Promise<Task> {
    const res = await lastValueFrom(this.interactions.createTask({
      ...dto,
      assignedUserId: dto.assignedUserId || '00000000-0000-0000-0000-000000000002',
    }))
    return JSON.parse(res.json)
  }

  async getTask(tenantId: string, id: string): Promise<Task> {
    const res = await lastValueFrom(this.interactions.getTask({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listTasks(data: {
    tenantId: string
    contactId?: string
    companyId?: string
    dealId?: string
    isCompleted?: boolean
    assignedUserId?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Task>> {
    const res = await lastValueFrom(this.interactions.listTasks(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateTask(data: {
    tenantId: string
    id: string
    title?: string
    description?: string
    dueDate?: string
    isCompleted?: boolean
  }): Promise<void> {
    await lastValueFrom(this.interactions.updateTask(data))
  }

  async deleteTask(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.interactions.deleteTask({ tenantId, id }))
  }

  async createCall(dto: {
    tenantId: string
    contactId?: string | null
    callType: string
    durationSeconds?: number | null
    summary?: string | null
    happenedAt: string
    authorUserId?: string | null
  }): Promise<Call> {
    const res = await lastValueFrom(this.interactions.createCall({
      ...dto,
      authorUserId: dto.authorUserId || '00000000-0000-0000-0000-000000000002',
    }))
    return JSON.parse(res.json)
  }

  async getCall(tenantId: string, id: string): Promise<Call> {
    const res = await lastValueFrom(this.interactions.getCall({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listCalls(data: {
    tenantId: string
    contactId?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Call>> {
    const res = await lastValueFrom(this.interactions.listCalls(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  // ─── Support Tickets ─────────────────────────────────────

  async createTicket(dto: {
    tenantId: string
    contactId?: string | null
    subject: string
    description: string
    priority?: string | null
  }): Promise<SupportTicket> {
    const res = await lastValueFrom(this.supportTickets.createTicket(dto))
    return JSON.parse(res.json)
  }

  async getTicket(tenantId: string, id: string): Promise<SupportTicket> {
    const res = await lastValueFrom(this.supportTickets.getTicket({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listTickets(data: {
    tenantId: string
    status?: string
    priority?: string
    assignedUserId?: string
    contactId?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<SupportTicket>> {
    const res = await lastValueFrom(this.supportTickets.listTickets(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateTicketStatus(data: { tenantId: string; id: string; status: string }): Promise<void> {
    await lastValueFrom(this.supportTickets.updateTicketStatus(data))
  }

  async assignTicket(data: { tenantId: string; id: string; assignedUserId: string }): Promise<void> {
    await lastValueFrom(this.supportTickets.assignTicket(data))
  }

  async addTicketReply(data: {
    tenantId: string
    ticketId: string
    message: string
    isInternalNote?: boolean
  }): Promise<TicketReply> {
    const res = await lastValueFrom(this.supportTickets.addTicketReply(data))
    return JSON.parse(res.json)
  }

  async getTicketReplies(tenantId: string, id: string): Promise<PaginatedResult<TicketReply>> {
    const res = await lastValueFrom(this.supportTickets.getTicketReplies({ tenantId, id }))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  // ─── Campaigns ───────────────────────────────────────────

  async createCampaign(dto: {
    tenantId: string
    name: string
    type?: string | null
    startDate?: string | null
    endDate?: string | null
    budgetedCost?: number
    expectedRevenue?: number
  }): Promise<Campaign> {
    const res = await lastValueFrom(this.campaigns.createCampaign(dto))
    return JSON.parse(res.json)
  }

  async getCampaign(tenantId: string, id: string): Promise<Campaign> {
    const res = await lastValueFrom(this.campaigns.getCampaign({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listCampaigns(data: {
    tenantId: string
    status?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Campaign>> {
    const res = await lastValueFrom(this.campaigns.listCampaigns(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateCampaign(data: {
    tenantId: string
    id: string
    name?: string
    type?: string | null
    startDate?: string | null
    endDate?: string | null
    budgetedCost?: number
    expectedRevenue?: number
  }): Promise<void> {
    await lastValueFrom(this.campaigns.updateCampaign(data))
  }

  async updateCampaignStatus(data: { tenantId: string; id: string; status: string }): Promise<void> {
    await lastValueFrom(this.campaigns.updateCampaignStatus(data))
  }

  async deleteCampaign(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.campaigns.deleteCampaign({ tenantId, id }))
  }

  async listCampaignMembers(data: {
    tenantId: string
    campaignId: string
    status?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<CampaignMember>> {
    const res = await lastValueFrom(this.campaigns.listMembers(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async addCampaignMember(data: { tenantId: string; campaignId: string; contactId: string }): Promise<CampaignMember> {
    const res = await lastValueFrom(this.campaigns.addMember(data))
    return JSON.parse(res.json)
  }

  async updateCampaignMemberStatus(data: { tenantId: string; id: string; status: string }): Promise<void> {
    await lastValueFrom(this.campaigns.updateMemberStatus(data))
  }

  // ─── Quotes ──────────────────────────────────────────────

  async createQuote(dto: {
    tenantId: string
    dealId?: string | null
    quoteNumber: string
    validUntil: string
    termsAndConditions?: string | null
    subtotal?: number
    taxTotal?: number
    grandTotal?: number
  }): Promise<Quote> {
    const res = await lastValueFrom(this.quotes.createQuote(dto))
    return JSON.parse(res.json)
  }

  async getQuote(tenantId: string, id: string): Promise<Quote> {
    const res = await lastValueFrom(this.quotes.getQuote({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listQuotes(data: {
    tenantId: string
    dealId?: string
    status?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Quote>> {
    const res = await lastValueFrom(this.quotes.listQuotes(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async sendQuote(data: { tenantId: string; id: string }): Promise<void> {
    await lastValueFrom(this.quotes.sendQuote(data))
  }

  async acceptQuote(data: { tenantId: string; id: string }): Promise<void> {
    await lastValueFrom(this.quotes.acceptQuote(data))
  }

  async rejectQuote(data: { tenantId: string; id: string; reason?: string }): Promise<void> {
    await lastValueFrom(this.quotes.rejectQuote(data))
  }

  // ─── Contracts ───────────────────────────────────────────

  async createContract(dto: {
    tenantId: string
    companyId: string
    dealId?: string | null
    name: string
    startDate: string
    endDate?: string | null
    autoRenew?: boolean
    mrrValue?: number
    ownerUserId?: string | null
  }): Promise<Contract> {
    const res = await lastValueFrom(this.contracts.createContract({
      ...dto,
      ownerUserId: dto.ownerUserId || '00000000-0000-0000-0000-000000000002',
    }))
    return JSON.parse(res.json)
  }

  async getContract(tenantId: string, id: string): Promise<Contract> {
    const res = await lastValueFrom(this.contracts.getContract({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listContracts(data: {
    tenantId: string
    companyId?: string
    status?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Contract>> {
    const res = await lastValueFrom(this.contracts.listContracts(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateContract(data: {
    tenantId: string
    id: string
    name?: string
    startDate?: string
    endDate?: string | null
    autoRenew?: boolean
    mrrValue?: number
    status?: string
  }): Promise<void> {
    await lastValueFrom(this.contracts.updateContract(data))
  }

  async renewContract(data: { tenantId: string; id: string }): Promise<void> {
    await lastValueFrom(this.contracts.renew(data))
  }

  async updateContractStatus(data: { tenantId: string; id: string; status: string }): Promise<void> {
    await lastValueFrom(this.contracts.updateContractStatus(data))
  }

  // ─── Sales Teams ─────────────────────────────────────────

  async createSalesTeam(dto: {
    tenantId: string
    name: string
    managerUserId?: string | null
    monthlyTarget?: number
  }): Promise<SalesTeam> {
    const res = await lastValueFrom(this.salesTeams.createTeam(dto))
    return JSON.parse(res.json)
  }

  async getSalesTeam(tenantId: string, id: string): Promise<SalesTeam> {
    const res = await lastValueFrom(this.salesTeams.getTeam({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listSalesTeams(data: {
    tenantId: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<SalesTeam>> {
    const res = await lastValueFrom(this.salesTeams.listTeams(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateSalesTeam(data: {
    tenantId: string
    id: string
    name?: string
    managerUserId?: string | null
    monthlyTarget?: number
  }): Promise<void> {
    await lastValueFrom(this.salesTeams.updateTeam(data))
  }

  async deleteSalesTeam(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.salesTeams.deleteTeam({ tenantId, id }))
  }

  async addTeamMember(data: { tenantId: string; teamId: string; userId: string }): Promise<void> {
    await lastValueFrom(this.salesTeams.addMember(data))
  }

  async removeTeamMember(data: { tenantId: string; teamId: string; userId: string }): Promise<void> {
    await lastValueFrom(this.salesTeams.removeMember(data))
  }

  async listTeamMembers(tenantId: string, id: string): Promise<string[]> {
    const res = await lastValueFrom(this.salesTeams.listMembers({ tenantId, id }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async setQuota(data: {
    tenantId: string
    userId: string
    teamId?: string
    periodMonth: number
    periodYear: number
    targetAmount: number
  }): Promise<SalesQuota> {
    const res = await lastValueFrom(this.salesTeams.setQuota(data))
    return JSON.parse(res.json)
  }

  async getQuota(tenantId: string, id: string): Promise<SalesQuota> {
    const res = await lastValueFrom(this.salesTeams.getQuota({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listQuotas(data: {
    tenantId: string
    teamId?: string
    userId?: string
    periodMonth?: number
    periodYear?: number
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<SalesQuota>> {
    const res = await lastValueFrom(this.salesTeams.listQuotas(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateAchieved(data: { tenantId: string; id: string; achievedAmount: number }): Promise<void> {
    await lastValueFrom(this.salesTeams.updateAchieved(data))
  }

  // ─── Helpdesk ────────────────────────────────────────────

  async createConversation(dto: { tenantId: string; [key: string]: unknown }): Promise<HelpdeskConversation> {
    const res = await lastValueFrom(this.helpdesk.createConversation(dto))
    return JSON.parse(res.json)
  }

  async getConversation(tenantId: string, id: string): Promise<HelpdeskConversation> {
    const res = await lastValueFrom(this.helpdesk.getConversation({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listConversations(data: {
    tenantId: string
    mailboxId?: string
    status?: string
    assignedAgentId?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<HelpdeskConversation>> {
    const res = await lastValueFrom(this.helpdesk.listConversations(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async assignConversation(data: { tenantId: string; id: string; agentId: string }): Promise<void> {
    await lastValueFrom(this.helpdesk.assignConversation(data))
  }

  async changeConversationStatus(data: { tenantId: string; id: string; status: string }): Promise<void> {
    await lastValueFrom(this.helpdesk.changeConversationStatus(data))
  }

  async resolveConversation(data: { tenantId: string; id: string; resolution?: string }): Promise<void> {
    await lastValueFrom(this.helpdesk.resolveConversation(data))
  }

  async listThreads(tenantId: string, id: string): Promise<PaginatedResult<HelpdeskThread>> {
    const res = await lastValueFrom(this.helpdesk.listThreads({ tenantId, id }))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async addThread(data: { tenantId: string; conversationId: string; [key: string]: unknown }): Promise<HelpdeskThread> {
    const res = await lastValueFrom(this.helpdesk.addThread(data))
    return JSON.parse(res.json)
  }

  async listMailboxes(tenantId: string): Promise<HelpdeskMailbox[]> {
    const res = await lastValueFrom(this.helpdesk.listMailboxes({ tenantId }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async createMailbox(dto: { tenantId: string; [key: string]: unknown }): Promise<HelpdeskMailbox> {
    const res = await lastValueFrom(this.helpdesk.createMailbox(dto))
    return JSON.parse(res.json)
  }

  async getAgentProfile(tenantId: string): Promise<Record<string, unknown>> {
    const res = await lastValueFrom(this.helpdesk.getAgentProfile({ tenantId }))
    return JSON.parse(res.json)
  }

  async updateAgentAvailability(data: { tenantId: string; userId: string; [key: string]: unknown }): Promise<void> {
    await lastValueFrom(this.helpdesk.updateAgentAvailability(data))
  }

  // ─── Affiliates ──────────────────────────────────────────

  async createProgram(dto: { tenantId: string; [key: string]: unknown }): Promise<AffiliateProgram> {
    const res = await lastValueFrom(this.affiliates.createProgram(dto))
    return JSON.parse(res.json)
  }

  async getProgram(tenantId: string, id: string): Promise<AffiliateProgram> {
    const res = await lastValueFrom(this.affiliates.getProgram({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listPrograms(data: {
    tenantId: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<AffiliateProgram>> {
    const res = await lastValueFrom(this.affiliates.listPrograms(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async updateProgram(data: {
    tenantId: string
    id: string
    [key: string]: unknown
  }): Promise<void> {
    await lastValueFrom(this.affiliates.updateProgram(data))
  }

  async registerAffiliate(dto: { tenantId: string; [key: string]: unknown }): Promise<Affiliate> {
    const res = await lastValueFrom(this.affiliates.registerAffiliate(dto))
    return JSON.parse(res.json)
  }

  async getAffiliate(tenantId: string, id: string): Promise<Affiliate> {
    const res = await lastValueFrom(this.affiliates.getAffiliate({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listAffiliates(data: {
    tenantId: string
    programId?: string
    status?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Affiliate>> {
    const res = await lastValueFrom(this.affiliates.listAffiliates(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async recordCommission(dto: { tenantId: string; affiliateId: string; [key: string]: unknown }): Promise<AffiliateCommission> {
    const res = await lastValueFrom(this.affiliates.recordCommission(dto))
    return JSON.parse(res.json)
  }

  async listCommissions(data: {
    tenantId: string
    affiliateId?: string
    programId?: string
    status?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<AffiliateCommission>> {
    const res = await lastValueFrom(this.affiliates.listCommissions(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async processPayout(dto: { tenantId: string; affiliateId: string; [key: string]: unknown }): Promise<AffiliatePayout> {
    const res = await lastValueFrom(this.affiliates.processPayout(dto))
    return JSON.parse(res.json)
  }

  async listPayouts(data: {
    tenantId: string
    affiliateId?: string
    status?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<AffiliatePayout>> {
    const res = await lastValueFrom(this.affiliates.listPayouts(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  // ─── Personal CRM ────────────────────────────────────────

  async createLifeEvent(dto: { tenantId: string; [key: string]: unknown }): Promise<LifeEvent> {
    const res = await lastValueFrom(this.personalCrm.createLifeEvent(dto))
    return JSON.parse(res.json)
  }

  async listLifeEvents(data: {
    tenantId: string
    contactId: string
    eventType?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<LifeEvent>> {
    const res = await lastValueFrom(this.personalCrm.listLifeEvents(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async createGift(dto: { tenantId: string; [key: string]: unknown }): Promise<Gift> {
    const res = await lastValueFrom(this.personalCrm.createGift(dto))
    return JSON.parse(res.json)
  }

  async listGifts(data: {
    tenantId: string
    contactId: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Gift>> {
    const res = await lastValueFrom(this.personalCrm.listGifts(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async createDebt(dto: { tenantId: string; [key: string]: unknown }): Promise<Debt> {
    const res = await lastValueFrom(this.personalCrm.createDebt(dto))
    return JSON.parse(res.json)
  }

  async listDebts(data: {
    tenantId: string
    contactId: string
    isSettled?: boolean
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Debt>> {
    const res = await lastValueFrom(this.personalCrm.listDebts(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async settleDebt(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.personalCrm.settleDebt({ tenantId, id }))
  }

  async createReminder(dto: { tenantId: string; [key: string]: unknown }): Promise<Reminder> {
    const res = await lastValueFrom(this.personalCrm.createReminder(dto))
    return JSON.parse(res.json)
  }

  async listReminders(data: {
    tenantId: string
    contactId: string
    isDone?: boolean
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Reminder>> {
    const res = await lastValueFrom(this.personalCrm.listReminders(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async toggleReminder(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.personalCrm.toggleReminder({ tenantId, id }))
  }

  async addPet(dto: { tenantId: string; [key: string]: unknown }): Promise<Pet> {
    const res = await lastValueFrom(this.personalCrm.addPet(dto))
    return JSON.parse(res.json)
  }

  async listPets(data: {
    tenantId: string
    contactId: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Pet>> {
    const res = await lastValueFrom(this.personalCrm.listPets(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  // ─── Loyalty ─────────────────────────────────────────────

  async getLoyaltyProfile(tenantId: string, id: string): Promise<Record<string, unknown>> {
    const res = await lastValueFrom(this.loyalty.getProfile({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async earnPoints(data: { tenantId: string; contactId: string; points: number; reason?: string }): Promise<Record<string, unknown>> {
    const res = await lastValueFrom(this.loyalty.earnPoints(data))
    return JSON.parse(res.json)
  }

  async redeemPoints(data: { tenantId: string; contactId: string; points: number; reason?: string }): Promise<Record<string, unknown>> {
    const res = await lastValueFrom(this.loyalty.redeemPoints(data))
    return JSON.parse(res.json)
  }

  async listLoyaltySegments(tenantId: string): Promise<CustomerSegment[]> {
    const res = await lastValueFrom(this.loyalty.listSegments({ tenantId }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async createSegment(dto: { tenantId: string; [key: string]: unknown }): Promise<CustomerSegment> {
    const res = await lastValueFrom(this.loyalty.createSegment(dto))
    return JSON.parse(res.json)
  }

  async assignToSegment(data: { tenantId: string; segmentId: string; contactId: string }): Promise<void> {
    await lastValueFrom(this.loyalty.assignToSegment(data))
  }

  async getLoyaltyMetrics(tenantId: string, id: string): Promise<Record<string, unknown>> {
    const res = await lastValueFrom(this.loyalty.getMetrics({ tenantId, id }))
    return JSON.parse(res.json)
  }

  // ─── Tags ─────────────────────────────────────────────────

  async createTag(data: { tenantId: string; name: string; color?: string }): Promise<Tag> {
    const res = await lastValueFrom(this.tags.createTag(data))
    return JSON.parse(res.json)
  }

  async getTag(tenantId: string, id: string): Promise<Tag> {
    const res = await lastValueFrom(this.tags.getTag({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async updateTag(data: { tenantId: string; id: string; name?: string; color?: string }): Promise<void> {
    await lastValueFrom(this.tags.updateTag(data))
  }

  async listTags(data: {
    tenantId: string
    search?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Tag>> {
    const res = await lastValueFrom(this.tags.listTags(data))
    return {
      data: (res.jsonItems ?? []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async deleteTag(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.tags.deleteTag({ tenantId, id }))
  }

  // ─── Automation ──────────────────────────────────────────

  async createWorkflow(dto: {
    tenantId: string
    name: string
    triggerEvent: string
    stepsGraph: WorkflowStep[]
    description?: string
    triggerFilter?: Record<string, unknown>
  }): Promise<WorkflowDefinition> {
    const res = await lastValueFrom(
      this.automation.createWorkflow({
        tenantId: dto.tenantId,
        name: dto.name,
        description: dto.description,
        triggerEvent: dto.triggerEvent,
        triggerFilterJson: dto.triggerFilter ? JSON.stringify(dto.triggerFilter) : undefined,
        stepsGraphJson: JSON.stringify(dto.stepsGraph),
      }),
    )
    return JSON.parse(res.json)
  }

  async getWorkflow(tenantId: string, id: string): Promise<WorkflowDefinition> {
    const res = await lastValueFrom(this.automation.getWorkflow({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listWorkflows(tenantId: string, status?: string): Promise<WorkflowDefinition[]> {
    const res = await lastValueFrom(this.automation.listWorkflows({ tenantId, status }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async activateWorkflow(tenantId: string, id: string): Promise<WorkflowDefinition> {
    const res = await lastValueFrom(this.automation.activateWorkflow({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async pauseWorkflow(tenantId: string, id: string): Promise<WorkflowDefinition> {
    const res = await lastValueFrom(this.automation.pauseWorkflow({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async triggerAutomationEvent(data: {
    tenantId: string
    eventName: string
    entityType: string
    entityId: string
    payload: Record<string, unknown>
  }): Promise<{ triggeredCount: number }> {
    const res = await lastValueFrom(
      this.automation.triggerEvent({
        tenantId: data.tenantId,
        eventName: data.eventName,
        entityType: data.entityType,
        entityId: data.entityId,
        payloadJson: JSON.stringify(data.payload),
      }),
    )
    return JSON.parse(res.json)
  }

  async getWorkflowExecution(
    tenantId: string,
    executionId: string,
  ): Promise<{ execution: WorkflowExecution; steps: any[] }> {
    const res = await lastValueFrom(
      this.automation.getWorkflowExecution({ tenantId, executionId }),
    )
    return {
      execution: JSON.parse(res.json),
      steps: (res.stepsJson ?? []).map((j: string) => JSON.parse(j)),
    }
  }

  async listWorkflowExecutions(data: {
    tenantId: string
    workflowId?: string
    status?: string
  }): Promise<WorkflowExecution[]> {
    const res = await lastValueFrom(this.automation.listWorkflowExecutions(data))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async cancelWorkflowExecution(
    tenantId: string,
    executionId: string,
    reason?: string,
  ): Promise<void> {
    await lastValueFrom(this.automation.cancelExecution({ tenantId, executionId, reason }))
  }

  // ─── Lead Scoring ────────────────────────────────────────

  async createScoringRule(dto: {
    tenantId: string
    name: string
    category: ScoringRuleCategory
    condition: ScoringCondition
    points: number
    description?: string
    decayDays?: number
    decayPoints?: number
  }): Promise<{ id: string }> {
    const res = await lastValueFrom(
      this.leadScoring.createScoringRule({
        tenantId: dto.tenantId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        conditionJson: JSON.stringify(dto.condition),
        points: dto.points,
        decayDays: dto.decayDays,
        decayPoints: dto.decayPoints,
      }),
    )
    return JSON.parse(res.json)
  }

  async toggleScoringRule(tenantId: string, id: string): Promise<LeadScoringRule> {
    const res = await lastValueFrom(this.leadScoring.toggleRuleStatus({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async listScoringRules(tenantId: string): Promise<LeadScoringRule[]> {
    const res = await lastValueFrom(this.leadScoring.listScoringRules({ tenantId }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async getLeadScore(tenantId: string, contactId: string): Promise<LeadScore | null> {
    const res = await lastValueFrom(this.leadScoring.getLeadScore({ tenantId, id: contactId }))
    return res.json && res.json !== '{}' ? JSON.parse(res.json) : null
  }

  async recalculateLeadScore(data: {
    tenantId: string
    contactId: string
    contactContext: Record<string, unknown>
  }): Promise<LeadScore> {
    const res = await lastValueFrom(
      this.leadScoring.recalculateLeadScore({
        tenantId: data.tenantId,
        contactId: data.contactId,
        contactContextJson: JSON.stringify(data.contactContext),
      }),
    )
    return JSON.parse(res.json)
  }

  async adjustLeadScore(data: {
    tenantId: string
    contactId: string
    points: number
    reason: string
    ruleId?: string
  }): Promise<LeadScore> {
    const res = await lastValueFrom(this.leadScoring.adjustLeadScore(data))
    return JSON.parse(res.json)
  }

  async applyScoreDecay(data: {
    tenantId: string
    contactId: string
    daysWithoutActivity: number
  }): Promise<LeadScore> {
    const res = await lastValueFrom(this.leadScoring.applyScoreDecay(data))
    return JSON.parse(res.json)
  }

  async listTopLeads(tenantId: string, limit = 20): Promise<LeadScore[]> {
    const res = await lastValueFrom(this.leadScoring.listTopLeads({ tenantId, limit }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  // ─── CPQ & E-Signature ───────────────────────────────────

  async createProduct(dto: {
    tenantId: string
    sku: string
    name: string
    unitPrice: number
    description?: string
    currency?: string
    pricingType?: ProductPricingType
    taxRate?: number
  }): Promise<Product> {
    const res = await lastValueFrom(this.cpq.createProduct(dto))
    return JSON.parse(res.json)
  }

  async getProduct(tenantId: string, id: string): Promise<Product> {
    const res = await lastValueFrom(this.cpq.getProduct({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async updateProduct(dto: {
    tenantId: string
    id: string
    name?: string
    unitPrice?: number
    description?: string | null
    currency?: string
    pricingType?: ProductPricingType
    taxRate?: number
    isActive?: boolean
  }): Promise<Product> {
    const res = await lastValueFrom(this.cpq.updateProduct(dto))
    return JSON.parse(res.json)
  }

  async deleteProduct(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.cpq.deleteProduct({ tenantId, id }))
  }

  async listProducts(tenantId: string): Promise<Product[]> {
    const res = await lastValueFrom(this.cpq.listProducts({ tenantId }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async createProductTemplate(dto: {
    tenantId: string
    name: string
    defaultUnitPrice: number
    category?: string
    defaultSkuPrefix?: string
    defaultCurrency?: string
    pricingType?: ProductPricingType
    defaultTaxRate?: number
    defaultDescription?: string
  }): Promise<ProductTemplate> {
    const res = await lastValueFrom(this.cpq.createProductTemplate(dto))
    return JSON.parse(res.json)
  }

  async listProductTemplates(tenantId: string): Promise<ProductTemplate[]> {
    const res = await lastValueFrom(this.cpq.listProductTemplates({ tenantId }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async deleteProductTemplate(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.cpq.deleteProductTemplate({ tenantId, id }))
  }

  async requestQuoteApproval(dto: {
    tenantId: string
    quoteId: string
    requestedDiscountPercent: number
    requestedByUserId: string
  }): Promise<{ id: string; status: string }> {
    const res = await lastValueFrom(this.cpq.requestQuoteApproval(dto))
    return JSON.parse(res.json)
  }

  async decideQuoteApproval(dto: {
    tenantId: string
    approvalId: string
    approverUserId: string
    status: 'APPROVED' | 'REJECTED'
    rejectionReason?: string
  }): Promise<QuoteApproval> {
    const res = await lastValueFrom(this.cpq.decideQuoteApproval(dto))
    return JSON.parse(res.json)
  }

  async listPendingApprovals(tenantId: string): Promise<QuoteApproval[]> {
    const res = await lastValueFrom(this.cpq.listPendingApprovals({ tenantId }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async initiateSignature(dto: {
    tenantId: string
    documentId: string
    signerName: string
    signerEmail: string
    documentType?: 'QUOTE' | 'CONTRACT'
    signerPhone?: string
    expiresInDays?: number
  }): Promise<ESignature> {
    const res = await lastValueFrom(this.cpq.initiateSignature(dto))
    return JSON.parse(res.json)
  }

  async verifySignatureOtp(token: string, otpCode: string): Promise<void> {
    await lastValueFrom(this.cpq.verifySignatureOtp({ token, otpCode }))
  }

  async submitSignature(dto: {
    token: string
    signatureDataUrl: string
    signerIp?: string
    signerUserAgent?: string
    documentHashSha256?: string
  }): Promise<ESignature> {
    const res = await lastValueFrom(this.cpq.submitSignature(dto))
    return JSON.parse(res.json)
  }

  async getSignatureByToken(token: string): Promise<ESignature> {
    const res = await lastValueFrom(this.cpq.getSignatureByToken({ token }))
    return JSON.parse(res.json)
  }

  // ─── Customer 360 ──────────────────────────────────────────

  async getCustomer360(tenantId: string, contactId: string): Promise<Customer360Profile> {
    const res = await lastValueFrom(this.customer360.getCustomer360({ tenantId, contactId }))
    return JSON.parse(res.json)
  }

  // ─── Omnichannel Inbox ─────────────────────────────────────

  async listInboxConversations(
    tenantId: string,
    channel?: string,
    status?: string,
  ): Promise<InboxConversation[]> {
    const res = await lastValueFrom(
      this.inbox.listConversations({ tenantId, channel, status }),
    )
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async getInboxConversation(tenantId: string, id: string): Promise<InboxConversation> {
    const res = await lastValueFrom(this.inbox.getConversation({ tenantId, id }))
    return JSON.parse(res.json)
  }

  async sendInboxMessage(dto: {
    tenantId: string
    conversationId?: string
    contactId?: string
    channel: InboxChannel
    recipientIdentifier: string
    subject?: string
    bodyText: string
  }): Promise<InboxMessage> {
    const res = await lastValueFrom(this.inbox.sendMessage(dto))
    return JSON.parse(res.json)
  }

  // ─── Revenue Analytics & Funnels ───────────────────────────

  async getRevenueMetrics(tenantId: string): Promise<RevenueMetrics> {
    const res = await lastValueFrom(this.analytics.getRevenueMetrics({ tenantId }))
    return JSON.parse(res.json)
  }

  async getFunnelMetrics(tenantId: string): Promise<FunnelMetrics> {
    const res = await lastValueFrom(this.analytics.getFunnelMetrics({ tenantId }))
    return JSON.parse(res.json)
  }

  async getCohortMetrics(tenantId: string): Promise<CohortMetrics> {
    const res = await lastValueFrom(this.analytics.getCohortMetrics({ tenantId }))
    return JSON.parse(res.json)
  }

  async getForecast(tenantId: string, horizon: '3M' | '6M' = '3M'): Promise<RevenueForecast> {
    const res = await lastValueFrom(this.analytics.getForecast({ tenantId, horizon }))
    return JSON.parse(res.json)
  }

  // ─── Knowledge Base & Customer Portal ──────────────────────

  async listKbCategories(tenantId: string): Promise<KnowledgeBaseCategory[]> {
    const res = await lastValueFrom(this.knowledgeBase.listCategories({ tenantId }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async createKbCategory(dto: unknown): Promise<KnowledgeBaseCategory> {
    const res = await lastValueFrom(this.knowledgeBase.createCategory(dto))
    return JSON.parse(res.json)
  }

  async listKbArticles(
    tenantId: string,
    filters?: { categoryId?: string; query?: string; publicOnly?: boolean },
  ): Promise<KnowledgeBaseArticle[]> {
    const res = await lastValueFrom(this.knowledgeBase.listArticles({ tenantId, ...filters }))
    return (res.jsonItems ?? []).map((j: string) => JSON.parse(j))
  }

  async getKbArticle(tenantId: string, idOrSlug: string): Promise<KnowledgeBaseArticle> {
    const res = await lastValueFrom(this.knowledgeBase.getArticle({ tenantId, idOrSlug }))
    return JSON.parse(res.json)
  }

  async createKbArticle(dto: unknown): Promise<KnowledgeBaseArticle> {
    const res = await lastValueFrom(this.knowledgeBase.createArticle(dto))
    return JSON.parse(res.json)
  }

  async voteKbArticle(dto: { tenantId: string; articleId: string; isHelpful: boolean }): Promise<KnowledgeBaseArticle> {
    const res = await lastValueFrom(this.knowledgeBase.voteArticle(dto))
    return JSON.parse(res.json)
  }

  async getCustomerPortalOverview(tenantId: string, contactId: string): Promise<CustomerPortalOverview> {
    const res = await lastValueFrom(this.knowledgeBase.getPortalOverview({ tenantId, contactId }))
    return JSON.parse(res.json)
  }

  // ─── AI Predictive & Copilot ────────────────────────────────

  async getDealWinProbability(tenantId: string, dealId: string): Promise<DealWinProbability> {
    const res = await lastValueFrom(this.ai.getDealWinProbability({ tenantId, dealId }))
    return JSON.parse(res.json)
  }

  async generateMessageDraft(dto: unknown): Promise<GeneratedMessageDraft> {
    const res = await lastValueFrom(this.ai.generateMessageDraft(dto))
    return JSON.parse(res.json)
  }

  async getContactExecutiveSummary(tenantId: string, contactId: string): Promise<ContactExecutiveSummary> {
    const res = await lastValueFrom(this.ai.getContactExecutiveSummary({ tenantId, contactId }))
    return JSON.parse(res.json)
  }

  async getChurnRiskPrediction(tenantId: string, contactId: string): Promise<ChurnRiskPrediction> {
    const res = await lastValueFrom(this.ai.getChurnRiskPrediction({ tenantId, contactId }))
    return JSON.parse(res.json)
  }

  // ─── Developer & Public API ─────────────────────────────────

  async createApiKey(dto: { tenantId: string; name: string; scopes: string[]; expiresAt?: string }): Promise<CreatedApiKey> {
    const res = await lastValueFrom(this.developer.createApiKey(dto))
    return JSON.parse(res.json)
  }

  async listApiKeys(tenantId: string): Promise<ApiKey[]> {
    const res = await lastValueFrom(this.developer.getApiKeys({ tenantId }))
    return JSON.parse(res.json)
  }

  async revokeApiKey(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.developer.revokeApiKey({ tenantId, id }))
  }

  async deleteApiKey(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.developer.deleteApiKey({ tenantId, id }))
  }


  async validateApiKey(rawKey: string): Promise<{ valid: boolean; tenantId: string; scopes: string[]; keyId: string }> {
    return lastValueFrom(this.developer.validateApiKey({ rawKey }))
  }

  async createWebhookEndpoint(dto: { tenantId: string; name: string; url: string; events: string[] }): Promise<WebhookEndpoint> {
    const res = await lastValueFrom(this.developer.createWebhookEndpoint(dto))
    return JSON.parse(res.json)
  }

  async listWebhookEndpoints(tenantId: string): Promise<WebhookEndpoint[]> {
    const res = await lastValueFrom(this.developer.getWebhookEndpoints({ tenantId }))
    return JSON.parse(res.json)
  }

  async deleteWebhookEndpoint(tenantId: string, id: string): Promise<void> {
    await lastValueFrom(this.developer.deleteWebhookEndpoint({ tenantId, id }))
  }

  async getDeliveryLogs(tenantId: string, endpointId: string): Promise<WebhookDeliveryLog[]> {
    const res = await lastValueFrom(this.developer.getDeliveryLogs({ tenantId, endpointId }))
    return JSON.parse(res.json)
  }

  async dispatchWebhookEvent(dto: { tenantId: string; event: string; payloadJson: string }): Promise<{ dispatched: number }> {
    const res = await lastValueFrom(this.developer.dispatchWebhookEvent(dto))
    return JSON.parse(res.json)
  }

  // ─── Audit ──────────────────────────────────────────────

  async listAuditLogs(dto: {
    tenantId?: string
    entityType?: string
    entityId?: string
    action?: string
    moduleName?: string
    userId?: string
    limit?: number
    cursor?: string
  }): Promise<{ data: any[]; nextCursor: string | null }> {
    const res = await lastValueFrom(this.audit.listAuditLogs(dto))
    return {
      data: (res.jsonItems || []).map((j: string) => JSON.parse(j)),
      nextCursor: res.nextCursor ?? null,
    }
  }

  async getAuditStats(tenantId: string): Promise<any> {
    const res = await lastValueFrom(this.audit.getAuditStats({ tenantId }))
    return JSON.parse(res.json)
  }
}

