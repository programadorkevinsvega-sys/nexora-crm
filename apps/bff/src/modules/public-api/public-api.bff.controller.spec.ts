import { PublicApiBffController } from './public-api.bff.controller'
import { PublicApiBffService } from './public-api.bff.service'

describe('PublicApiBffController - Comprehensive Tests', () => {
  let controller: PublicApiBffController
  let mockService: jest.Mocked<PublicApiBffService>

  const tenantId = '00000000-0000-0000-0000-000000000001'
  const mockReq = {
    apiKeyContext: {
      tenantId,
      scopes: [
        'contacts:read', 'contacts:write', 'companies:read', 'companies:write',
        'deals:read', 'deals:write', 'interactions:read', 'interactions:write',
        'tickets:read', 'tickets:write', 'quotes:read', 'quotes:write',
        'contracts:read', 'contracts:write', 'campaigns:read', 'campaigns:write',
        'scoring:read', 'scoring:write', 'kb:read', 'ai:read', 'ai:write',
      ],
    },
  }

  beforeEach(() => {
    mockService = {
      listContacts: jest.fn(),
      getContact: jest.fn(),
      createContact: jest.fn(),
      updateContact: jest.fn(),
      deleteContact: jest.fn(),
      getCustomer360: jest.fn(),
      listCompanies: jest.fn(),
      getCompany: jest.fn(),
      createCompany: jest.fn(),
      updateCompany: jest.fn(),
      deleteCompany: jest.fn(),
      listDeals: jest.fn(),
      getDeal: jest.fn(),
      createDeal: jest.fn(),
      patchDeal: jest.fn(),
      moveDeal: jest.fn(),
      winDeal: jest.fn(),
      loseDeal: jest.fn(),
      deleteDeal: jest.fn(),
      listNotes: jest.fn(),
      createNote: jest.fn(),
      listTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      listCalls: jest.fn(),
      createCall: jest.fn(),
      listTickets: jest.fn(),
      getTicket: jest.fn(),
      createTicket: jest.fn(),
      updateTicketStatus: jest.fn(),
      addTicketReply: jest.fn(),
      listProducts: jest.fn(),
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      listQuotes: jest.fn(),
      getQuote: jest.fn(),
      createQuote: jest.fn(),
      acceptQuote: jest.fn(),
      rejectQuote: jest.fn(),
      listContracts: jest.fn(),
      getContract: jest.fn(),
      createContract: jest.fn(),
      listCampaigns: jest.fn(),
      getCampaign: jest.fn(),
      createCampaign: jest.fn(),
      addCampaignMember: jest.fn(),
      getLeadScore: jest.fn(),
      recalculateLeadScore: jest.fn(),
      listKbCategories: jest.fn(),
      listKbArticles: jest.fn(),
      getKbArticle: jest.fn(),
      getDealWinProbability: jest.fn(),
      generateMessageDraft: jest.fn(),
      getContactSummary: jest.fn(),
      getChurnRisk: jest.fn(),
    } as any

    controller = new PublicApiBffController(mockService)
  })

  it('GET /api/v1/contacts should list contacts', async () => {
    mockService.listContacts.mockResolvedValue({ data: [], nextCursor: null } as any)
    const res = await controller.listContacts({ limit: 10 }, mockReq)
    expect(mockService.listContacts).toHaveBeenCalledWith(tenantId, { limit: 10 })
  })

  it('GET /api/v1/contacts/:id/360 should return Customer 360 profile', async () => {
    mockService.getCustomer360.mockResolvedValue({ contact: { id: 'c-1' } } as any)
    const res = await controller.getCustomer360('c-1', mockReq)
    expect(mockService.getCustomer360).toHaveBeenCalledWith(tenantId, 'c-1')
  })

  it('POST /api/v1/companies should create company', async () => {
    mockService.createCompany.mockResolvedValue({ id: 'comp-1', name: 'Acme Corp' } as any)
    const res = await controller.createCompany({ name: 'Acme Corp' }, mockReq)
    expect(res.name).toBe('Acme Corp')
  })

  it('POST /api/v1/deals/:id/win should mark deal as WON', async () => {
    mockService.winDeal.mockResolvedValue({ id: 'd-1', status: 'WON', amount: 50000 } as any)
    const res = await controller.winDeal('d-1', 50000, mockReq)
    expect(mockService.winDeal).toHaveBeenCalledWith(tenantId, 'd-1', 50000)
  })

  it('POST /api/v1/notes should create note', async () => {
    mockService.createNote.mockResolvedValue({ id: 'n-1', content: 'Met with client' } as any)
    const res = await controller.createNote({ content: 'Met with client' }, mockReq)
    expect(mockService.createNote).toHaveBeenCalled()
  })

  it('POST /api/v1/tickets/:id/reply should add ticket reply', async () => {
    mockService.addTicketReply.mockResolvedValue({ id: 'tr-1', message: 'Resolved' } as any)
    const res = await controller.addTicketReply('t-1', 'Resolved', mockReq)
    expect(mockService.addTicketReply).toHaveBeenCalledWith(tenantId, 't-1', 'Resolved')
  })

  it('GET /api/v1/ai/deals/:dealId/win-probability should return win prediction', async () => {
    mockService.getDealWinProbability.mockResolvedValue({ winProbabilityPercent: 88 } as any)
    const res = await controller.getDealWinProbability('d-1', mockReq)
    expect(res.winProbabilityPercent).toBe(88)
  })

  it('GET /api/v1/scoring/leads/:contactId should return lead score', async () => {
    mockService.getLeadScore.mockResolvedValue({ score: 95, temperature: 'HOT' } as any)
    const res = await controller.getLeadScore('c-1', mockReq)
    expect(res?.temperature).toBe('HOT')
  })

  it('POST /api/v1/quotes/:id/accept should accept quote', async () => {
    mockService.acceptQuote.mockResolvedValue({ success: true } as any)
    const res = await controller.acceptQuote('q-1', mockReq)
    expect(res.success).toBe(true)
  })

  it('GET /api/v1/kb/categories should list KB categories', async () => {
    mockService.listKbCategories.mockResolvedValue([{ id: 'cat-1', name: 'General' }] as any)
    const res = await controller.listKbCategories(mockReq)
    expect(res).toHaveLength(1)
  })
})
