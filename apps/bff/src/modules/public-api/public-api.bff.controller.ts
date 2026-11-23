import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, Req, UseGuards, ParseUUIDPipe,
} from '@nestjs/common'
import { PublicApiBffService } from './public-api.bff.service'
import { ApiKeyGuard } from '../../common/guards/api-key.guard'
import { ScopeGuard } from '../../common/guards/scope.guard'
import { RequireScope } from '../../common/decorators/require-scope.decorator'
import {
  CreateCampaignBody,
  CreateCallBody,
  CreateCompanyBody,
  CreateContactBody,
  CreateContractBody,
  CreateDealBody,
  CreateNoteBody,
  CreateProductBody,
  CreateQuoteBody,
  CreateTaskBody,
  CreateTicketBody,
  ListCallsQuery,
  ListCampaignsQuery,
  ListCompaniesQuery,
  ListContactsQuery,
  ListContractsQuery,
  ListDealsQuery,
  ListKbArticlesQuery,
  ListNotesQuery,
  ListQuotesQuery,
  ListTasksQuery,
  ListTicketsQuery,
  PublicApiRequest,
  RawPublicApiQuery,
  UpdateCompanyBody,
  UpdateContactBody,
  UpdateDealBody,
  UpdateTaskBody,
  parsePublicApiQuery,
} from './public-api.types'

@Controller('api/v1')
@UseGuards(ApiKeyGuard, ScopeGuard)
export class PublicApiBffController {
  constructor(private readonly service: PublicApiBffService) {}

  // ── Contacts ──────────────────────────────────────────
  @Get('contacts')
  @RequireScope('contacts:read')
  async listContacts(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listContacts(req.apiKeyContext.tenantId, parsePublicApiQuery<ListContactsQuery>(q, { allowedKeys: ['cursor', 'limit', 'search', 'leadStatus', 'companyId', 'isStarred', 'assignedUserId'], numericKeys: ['limit'], booleanKeys: ['isStarred'] })) }

  @Get('contacts/:id')
  @RequireScope('contacts:read')
  async getContact(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getContact(req.apiKeyContext.tenantId, id) }

  @Post('contacts')
  @RequireScope('contacts:write')
  async createContact(@Body() dto: CreateContactBody, @Req() req: PublicApiRequest) { return this.service.createContact(req.apiKeyContext.tenantId, dto) }

  @Patch('contacts/:id')
  @RequireScope('contacts:write')
  async updateContact(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateContactBody, @Req() req: PublicApiRequest) { return this.service.updateContact(req.apiKeyContext.tenantId, id, dto) }

  @Delete('contacts/:id')
  @RequireScope('contacts:write')
  async deleteContact(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.deleteContact(req.apiKeyContext.tenantId, id) }

  @Get('contacts/:id/360')
  @RequireScope('contacts:read')
  async getCustomer360(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getCustomer360(req.apiKeyContext.tenantId, id) }

  // ── Companies ─────────────────────────────────────────
  @Get('companies')
  @RequireScope('companies:read')
  async listCompanies(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listCompanies(req.apiKeyContext.tenantId, parsePublicApiQuery<ListCompaniesQuery>(q, { allowedKeys: ['cursor', 'limit', 'search', 'industry'], numericKeys: ['limit'] })) }

  @Get('companies/:id')
  @RequireScope('companies:read')
  async getCompany(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getCompany(req.apiKeyContext.tenantId, id) }

  @Post('companies')
  @RequireScope('companies:write')
  async createCompany(@Body() dto: CreateCompanyBody, @Req() req: PublicApiRequest) { return this.service.createCompany(req.apiKeyContext.tenantId, dto) }

  @Patch('companies/:id')
  @RequireScope('companies:write')
  async updateCompany(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCompanyBody, @Req() req: PublicApiRequest) { return this.service.updateCompany(req.apiKeyContext.tenantId, id, dto) }

  @Delete('companies/:id')
  @RequireScope('companies:write')
  async deleteCompany(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.deleteCompany(req.apiKeyContext.tenantId, id) }

  // ── Deals & Pipelines ─────────────────────────────────
  @Get('deals')
  @RequireScope('deals:read')
  async listDeals(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listDeals(req.apiKeyContext.tenantId, parsePublicApiQuery<ListDealsQuery>(q, { allowedKeys: ['pipelineId', 'stageId', 'status', 'contactId', 'companyId', 'assignedUserId', 'search', 'cursor', 'limit'], numericKeys: ['limit'] })) }

  @Get('deals/:id')
  @RequireScope('deals:read')
  async getDeal(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getDeal(req.apiKeyContext.tenantId, id) }

  @Post('deals')
  @RequireScope('deals:write')
  async createDeal(@Body() dto: CreateDealBody, @Req() req: PublicApiRequest) { return this.service.createDeal(req.apiKeyContext.tenantId, dto) }

  @Patch('deals/:id')
  @RequireScope('deals:write')
  async patchDeal(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDealBody, @Req() req: PublicApiRequest) { return this.service.patchDeal(req.apiKeyContext.tenantId, id, dto) }

  @Post('deals/:id/stage')
  @RequireScope('deals:write')
  async moveDeal(@Param('id', ParseUUIDPipe) id: string, @Body('stageId') stageId: string, @Req() req: PublicApiRequest) { return this.service.moveDeal(req.apiKeyContext.tenantId, id, stageId) }

  @Post('deals/:id/win')
  @RequireScope('deals:write')
  async winDeal(@Param('id', ParseUUIDPipe) id: string, @Body('amount') amount: number, @Req() req: PublicApiRequest) { return this.service.winDeal(req.apiKeyContext.tenantId, id, amount) }

  @Post('deals/:id/lose')
  @RequireScope('deals:write')
  async loseDeal(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { reasonId?: string; notes?: string }, @Req() req: PublicApiRequest) { return this.service.loseDeal(req.apiKeyContext.tenantId, id, dto.reasonId, dto.notes) }

  @Delete('deals/:id')
  @RequireScope('deals:write')
  async deleteDeal(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.deleteDeal(req.apiKeyContext.tenantId, id) }

  // ── Interactions ──────────────────────────────────────
  @Get('notes')
  @RequireScope('interactions:read')
  async listNotes(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listNotes(req.apiKeyContext.tenantId, parsePublicApiQuery<ListNotesQuery>(q, { allowedKeys: ['contactId', 'companyId', 'dealId', 'cursor', 'limit'], numericKeys: ['limit'] })) }

  @Post('notes')
  @RequireScope('interactions:write')
  async createNote(@Body() dto: CreateNoteBody, @Req() req: PublicApiRequest) { return this.service.createNote(req.apiKeyContext.tenantId, dto) }

  @Get('tasks')
  @RequireScope('interactions:read')
  async listTasks(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listTasks(req.apiKeyContext.tenantId, parsePublicApiQuery<ListTasksQuery>(q, { allowedKeys: ['contactId', 'companyId', 'dealId', 'isCompleted', 'assignedUserId', 'cursor', 'limit'], numericKeys: ['limit'], booleanKeys: ['isCompleted'] })) }

  @Post('tasks')
  @RequireScope('interactions:write')
  async createTask(@Body() dto: CreateTaskBody, @Req() req: PublicApiRequest) { return this.service.createTask(req.apiKeyContext.tenantId, dto) }

  @Patch('tasks/:id')
  @RequireScope('interactions:write')
  async updateTask(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskBody, @Req() req: PublicApiRequest) { return this.service.updateTask(req.apiKeyContext.tenantId, id, dto) }

  @Get('calls')
  @RequireScope('interactions:read')
  async listCalls(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listCalls(req.apiKeyContext.tenantId, parsePublicApiQuery<ListCallsQuery>(q, { allowedKeys: ['contactId', 'cursor', 'limit'], numericKeys: ['limit'] })) }

  @Post('calls')
  @RequireScope('interactions:write')
  async createCall(@Body() dto: CreateCallBody, @Req() req: PublicApiRequest) { return this.service.createCall(req.apiKeyContext.tenantId, dto) }

  // ── Support Tickets ───────────────────────────────────
  @Get('tickets')
  @RequireScope('tickets:read')
  async listTickets(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listTickets(req.apiKeyContext.tenantId, parsePublicApiQuery<ListTicketsQuery>(q, { allowedKeys: ['status', 'priority', 'assignedUserId', 'contactId', 'cursor', 'limit'], numericKeys: ['limit'] })) }

  @Get('tickets/:id')
  @RequireScope('tickets:read')
  async getTicket(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getTicket(req.apiKeyContext.tenantId, id) }

  @Post('tickets')
  @RequireScope('tickets:write')
  async createTicket(@Body() dto: CreateTicketBody, @Req() req: PublicApiRequest) { return this.service.createTicket(req.apiKeyContext.tenantId, dto) }

  @Patch('tickets/:id/status')
  @RequireScope('tickets:write')
  async updateTicketStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: string, @Req() req: PublicApiRequest) { return this.service.updateTicketStatus(req.apiKeyContext.tenantId, id, status) }

  @Post('tickets/:id/reply')
  @RequireScope('tickets:write')
  async addTicketReply(@Param('id', ParseUUIDPipe) id: string, @Body('message') msg: string, @Req() req: PublicApiRequest) { return this.service.addTicketReply(req.apiKeyContext.tenantId, id, msg) }

  // ── CPQ & Quotes ──────────────────────────────────────
  @Get('products')
  @RequireScope('quotes:read')
  async listProducts(@Req() req: PublicApiRequest) { return this.service.listProducts(req.apiKeyContext.tenantId) }

  @Get('products/:id')
  @RequireScope('quotes:read')
  async getProduct(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getProduct(req.apiKeyContext.tenantId, id) }

  @Post('products')
  @RequireScope('quotes:write')
  async createProduct(@Body() dto: CreateProductBody, @Req() req: PublicApiRequest) { return this.service.createProduct(req.apiKeyContext.tenantId, dto) }

  @Get('quotes')
  @RequireScope('quotes:read')
  async listQuotes(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listQuotes(req.apiKeyContext.tenantId, parsePublicApiQuery<ListQuotesQuery>(q, { allowedKeys: ['dealId', 'status', 'cursor', 'limit'], numericKeys: ['limit'] })) }

  @Get('quotes/:id')
  @RequireScope('quotes:read')
  async getQuote(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getQuote(req.apiKeyContext.tenantId, id) }

  @Post('quotes')
  @RequireScope('quotes:write')
  async createQuote(@Body() dto: CreateQuoteBody, @Req() req: PublicApiRequest) { return this.service.createQuote(req.apiKeyContext.tenantId, dto) }

  @Post('quotes/:id/accept')
  @RequireScope('quotes:write')
  async acceptQuote(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.acceptQuote(req.apiKeyContext.tenantId, id) }

  @Post('quotes/:id/reject')
  @RequireScope('quotes:write')
  async rejectQuote(@Param('id', ParseUUIDPipe) id: string, @Body('reason') r: string, @Req() req: PublicApiRequest) { return this.service.rejectQuote(req.apiKeyContext.tenantId, id, r) }

  // ── Contracts ─────────────────────────────────────────
  @Get('contracts')
  @RequireScope('contracts:read')
  async listContracts(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listContracts(req.apiKeyContext.tenantId, parsePublicApiQuery<ListContractsQuery>(q, { allowedKeys: ['companyId', 'status', 'cursor', 'limit'], numericKeys: ['limit'] })) }

  @Get('contracts/:id')
  @RequireScope('contracts:read')
  async getContract(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getContract(req.apiKeyContext.tenantId, id) }

  @Post('contracts')
  @RequireScope('contracts:write')
  async createContract(@Body() dto: CreateContractBody, @Req() req: PublicApiRequest) { return this.service.createContract(req.apiKeyContext.tenantId, dto) }

  // ── Campaigns ─────────────────────────────────────────
  @Get('campaigns')
  @RequireScope('campaigns:read')
  async listCampaigns(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listCampaigns(req.apiKeyContext.tenantId, parsePublicApiQuery<ListCampaignsQuery>(q, { allowedKeys: ['status', 'cursor', 'limit'], numericKeys: ['limit'] })) }

  @Get('campaigns/:id')
  @RequireScope('campaigns:read')
  async getCampaign(@Param('id', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getCampaign(req.apiKeyContext.tenantId, id) }

  @Post('campaigns')
  @RequireScope('campaigns:write')
  async createCampaign(@Body() dto: CreateCampaignBody, @Req() req: PublicApiRequest) { return this.service.createCampaign(req.apiKeyContext.tenantId, dto) }

  @Post('campaigns/:id/members')
  @RequireScope('campaigns:write')
  async addCampaignMember(@Param('id', ParseUUIDPipe) id: string, @Body('contactId') cId: string, @Req() req: PublicApiRequest) { return this.service.addCampaignMember(req.apiKeyContext.tenantId, id, cId) }

  // ── Lead Scoring ──────────────────────────────────────
  @Get('scoring/leads/:contactId')
  @RequireScope('scoring:read')
  async getLeadScore(@Param('contactId', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.getLeadScore(req.apiKeyContext.tenantId, id) }

  @Post('scoring/leads/:contactId/recalculate')
  @RequireScope('scoring:write')
  async recalculateScore(@Param('contactId', ParseUUIDPipe) id: string, @Req() req: PublicApiRequest) { return this.service.recalculateLeadScore(req.apiKeyContext.tenantId, id) }

  // ── Knowledge Base ────────────────────────────────────
  @Get('kb/categories')
  @RequireScope('kb:read')
  async listKbCategories(@Req() req: PublicApiRequest) { return this.service.listKbCategories(req.apiKeyContext.tenantId) }

  @Get('kb/articles')
  @RequireScope('kb:read')
  async listKbArticles(@Query() q: RawPublicApiQuery, @Req() req: PublicApiRequest) { return this.service.listKbArticles(req.apiKeyContext.tenantId, parsePublicApiQuery<ListKbArticlesQuery>(q, { allowedKeys: ['categoryId', 'query', 'publicOnly'], booleanKeys: ['publicOnly'] })) }

  @Get('kb/articles/:idOrSlug')
  @RequireScope('kb:read')
  async getKbArticle(@Param('idOrSlug') idOrSlug: string, @Req() req: PublicApiRequest) { return this.service.getKbArticle(req.apiKeyContext.tenantId, idOrSlug) }

  // ── AI Copilot ────────────────────────────────────────
  @Get('ai/deals/:dealId/win-probability')
  @RequireScope('ai:read')
  async getDealWinProbability(@Param('dealId', ParseUUIDPipe) dealId: string, @Req() req: PublicApiRequest) { return this.service.getDealWinProbability(req.apiKeyContext.tenantId, dealId) }

  @Post('ai/drafts/generate')
  @RequireScope('ai:write')
  async generateDraft(@Body() dto: Record<string, unknown>, @Req() req: PublicApiRequest) { return this.service.generateMessageDraft(req.apiKeyContext.tenantId, dto) }

  @Get('ai/contacts/:contactId/summary')
  @RequireScope('ai:read')
  async getContactSummary(@Param('contactId', ParseUUIDPipe) contactId: string, @Req() req: PublicApiRequest) { return this.service.getContactSummary(req.apiKeyContext.tenantId, contactId) }

  @Get('ai/contacts/:contactId/churn-risk')
  @RequireScope('ai:read')
  async getChurnRisk(@Param('contactId', ParseUUIDPipe) contactId: string, @Req() req: PublicApiRequest) { return this.service.getChurnRisk(req.apiKeyContext.tenantId, contactId) }
}
