import { Injectable, NotFoundException } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'

@Injectable()
export class PublicApiBffService {
  constructor(
    private readonly grpc: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  // ── Contacts ──────────────────────────────────────────
  async listContacts(tenantId: string, query: any): Promise<any> {
    return this.grpc.listContacts({ tenantId, ...query })
  }
  async getContact(tenantId: string, id: string): Promise<any> {
    const contact = await this.grpc.getContact(tenantId, id)
    if (!contact) throw new NotFoundException(`Contact ${id} not found`)
    return contact
  }
  async createContact(tenantId: string, dto: any): Promise<any> {
    return this.grpc.createContact({ tenantId, ...dto })
  }
  async updateContact(tenantId: string, id: string, dto: any): Promise<any> {
    await this.grpc.updateContact({ tenantId, id, ...dto })
    return this.getContact(tenantId, id)
  }
  async deleteContact(tenantId: string, id: string): Promise<any> {
    await this.grpc.deleteContact(tenantId, id)
    return { success: true }
  }
  async getCustomer360(tenantId: string, contactId: string): Promise<any> {
    return this.grpc.getCustomer360(tenantId, contactId)
  }

  // ── Companies ─────────────────────────────────────────
  async listCompanies(tenantId: string, query: any): Promise<any> {
    return this.grpc.listCompanies({ tenantId, ...query })
  }
  async getCompany(tenantId: string, id: string): Promise<any> {
    const company = await this.grpc.getCompany(tenantId, id)
    if (!company) throw new NotFoundException(`Company ${id} not found`)
    return company
  }
  async createCompany(tenantId: string, dto: any): Promise<any> {
    return this.grpc.createCompany({ tenantId, ...dto })
  }
  async updateCompany(tenantId: string, id: string, dto: any): Promise<any> {
    await this.grpc.updateCompany({ tenantId, id, ...dto })
    return this.getCompany(tenantId, id)
  }
  async deleteCompany(tenantId: string, id: string): Promise<any> {
    await this.grpc.deleteCompany(tenantId, id)
    return { success: true }
  }

  // ── Deals & Pipelines ─────────────────────────────────
  async listDeals(tenantId: string, query: any): Promise<any> {
    return this.grpc.listDeals({ tenantId, ...query })
  }
  async getDeal(tenantId: string, id: string): Promise<any> {
    const deal = await this.grpc.getDeal(tenantId, id)
    if (!deal) throw new NotFoundException(`Deal ${id} not found`)
    return deal
  }
  async createDeal(tenantId: string, dto: any): Promise<any> {
    return this.grpc.createDeal({ tenantId, ...dto })
  }
  async patchDeal(tenantId: string, id: string, dto: any): Promise<any> {
    await this.grpc.updateDeal({ tenantId, id, ...dto })
    return this.getDeal(tenantId, id)
  }
  async moveDeal(tenantId: string, id: string, stageId: string): Promise<any> {
    return this.grpc.moveDeal(tenantId, id, stageId)
  }
  async winDeal(tenantId: string, id: string, amount?: number): Promise<any> {
    return this.grpc.winDeal(tenantId, id, amount)
  }
  async loseDeal(tenantId: string, id: string, reasonId?: string, notes?: string): Promise<any> {
    return this.grpc.loseDeal(tenantId, id, reasonId, notes)
  }
  async deleteDeal(tenantId: string, id: string): Promise<any> {
    await this.grpc.deleteDeal(tenantId, id)
    return { success: true }
  }

  // ── Interactions ──────────────────────────────────────
  async listNotes(tenantId: string, query: any): Promise<any> { return this.grpc.listNotes({ tenantId, ...query }) }
  async createNote(tenantId: string, dto: any): Promise<any> { return this.grpc.createNote({ tenantId, ...dto }) }
  async listTasks(tenantId: string, query: any): Promise<any> { return this.grpc.listTasks({ tenantId, ...query }) }
  async createTask(tenantId: string, dto: any): Promise<any> { return this.grpc.createTask({ tenantId, ...dto }) }
  async updateTask(tenantId: string, id: string, dto: any): Promise<any> { await this.grpc.updateTask({ tenantId, id, ...dto }); return { success: true } }
  async listCalls(tenantId: string, query: any): Promise<any> { return this.grpc.listCalls({ tenantId, ...query }) }
  async createCall(tenantId: string, dto: any): Promise<any> { return this.grpc.createCall({ tenantId, ...dto }) }

  // ── Support Tickets ───────────────────────────────────
  async listTickets(tenantId: string, query: any): Promise<any> { return this.grpc.listTickets({ tenantId, ...query }) }
  async getTicket(tenantId: string, id: string): Promise<any> {
    const ticket = await this.grpc.getTicket(tenantId, id)
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`)
    return ticket
  }
  async createTicket(tenantId: string, dto: any): Promise<any> { return this.grpc.createTicket({ tenantId, ...dto }) }
  async updateTicketStatus(tenantId: string, id: string, status: string): Promise<any> {
    await this.grpc.updateTicketStatus({ tenantId, id, status })
    return this.getTicket(tenantId, id)
  }
  async addTicketReply(tenantId: string, ticketId: string, message: string): Promise<any> {
    return this.grpc.addTicketReply({
      tenantId,
      ticketId,
      authorType: 'SYSTEM',
      authorId: '00000000-0000-0000-0000-000000000002',
      message,
      isInternalNote: false,
    })
  }

  // ── CPQ & Quotes ──────────────────────────────────────
  async listProducts(tenantId: string): Promise<any> { return this.grpc.listProducts(tenantId) }
  async getProduct(tenantId: string, id: string): Promise<any> { return this.grpc.getProduct(tenantId, id) }
  async createProduct(tenantId: string, dto: any): Promise<any> { return this.grpc.createProduct({ tenantId, ...dto }) }
  async listQuotes(tenantId: string, query: any): Promise<any> { return this.grpc.listQuotes({ tenantId, ...query }) }
  async getQuote(tenantId: string, id: string): Promise<any> {
    const quote = await this.grpc.getQuote(tenantId, id)
    if (!quote) throw new NotFoundException(`Quote ${id} not found`)
    return quote
  }
  async createQuote(tenantId: string, dto: any): Promise<any> { return this.grpc.createQuote({ tenantId, ...dto }) }
  async acceptQuote(tenantId: string, id: string): Promise<any> { await this.grpc.acceptQuote({ tenantId, id }); return { success: true } }
  async rejectQuote(tenantId: string, id: string, reason?: string): Promise<any> { await this.grpc.rejectQuote({ tenantId, id, reason }); return { success: true } }

  // ── Contracts ─────────────────────────────────────────
  async listContracts(tenantId: string, query: any): Promise<any> { return this.grpc.listContracts({ tenantId, ...query }) }
  async getContract(tenantId: string, id: string): Promise<any> { return this.grpc.getContract(tenantId, id) }
  async createContract(tenantId: string, dto: any): Promise<any> { return this.grpc.createContract({ tenantId, ...dto }) }

  // ── Campaigns ─────────────────────────────────────────
  async listCampaigns(tenantId: string, query: any): Promise<any> { return this.grpc.listCampaigns({ tenantId, ...query }) }
  async getCampaign(tenantId: string, id: string): Promise<any> { return this.grpc.getCampaign(tenantId, id) }
  async createCampaign(tenantId: string, dto: any): Promise<any> { return this.grpc.createCampaign({ tenantId, ...dto }) }
  async addCampaignMember(tenantId: string, campaignId: string, contactId: string): Promise<any> {
    return this.grpc.addCampaignMember({ tenantId, campaignId, contactId })
  }

  // ── Lead Scoring ──────────────────────────────────────
  async getLeadScore(tenantId: string, contactId: string): Promise<any> {
    return this.grpc.getLeadScore(tenantId, contactId)
  }
  async recalculateLeadScore(tenantId: string, contactId: string, contactContext?: Record<string, unknown>): Promise<any> {
    return this.grpc.recalculateLeadScore({ tenantId, contactId, contactContext: contactContext || {} })
  }

  // ── Knowledge Base ────────────────────────────────────
  async listKbCategories(tenantId: string): Promise<any> { return this.grpc.listKbCategories(tenantId) }
  async listKbArticles(tenantId: string, query: any): Promise<any> { return this.grpc.listKbArticles(tenantId, query) }
  async getKbArticle(tenantId: string, idOrSlug: string): Promise<any> { return this.grpc.getKbArticle(tenantId, idOrSlug) }

  // ── AI Copilot ────────────────────────────────────────
  async getDealWinProbability(tenantId: string, dealId: string): Promise<any> { return this.grpc.getDealWinProbability(tenantId, dealId) }
  async generateMessageDraft(tenantId: string, dto: any): Promise<any> { return this.grpc.generateMessageDraft({ tenantId, ...dto }) }
  async getContactSummary(tenantId: string, contactId: string): Promise<any> { return this.grpc.getContactExecutiveSummary(tenantId, contactId) }
  async getChurnRisk(tenantId: string, contactId: string): Promise<any> { return this.grpc.getChurnRiskPrediction(tenantId, contactId) }
}
