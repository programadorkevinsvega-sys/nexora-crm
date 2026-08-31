import { KnowledgeBaseBffController } from './knowledge-base.bff.controller'
import { KnowledgeBaseBffService } from './knowledge-base.bff.service'
import type { KnowledgeBaseCategory, KnowledgeBaseArticle, CustomerPortalOverview } from '@crm/contracts'

describe('KnowledgeBaseBffController', () => {
  let controller: KnowledgeBaseBffController
  let mockService: jest.Mocked<KnowledgeBaseBffService>

  beforeEach(() => {
    mockService = {
      listCategories: jest.fn(),
      createCategory: jest.fn(),
      listArticles: jest.fn(),
      getArticle: jest.fn(),
      createArticle: jest.fn(),
      voteArticle: jest.fn(),
      getPortalOverview: jest.fn(),
    } as any

    controller = new KnowledgeBaseBffController(mockService)
  })

  it('should list categories on GET /api/kb/categories', async () => {
    mockService.listCategories.mockResolvedValue([])

    const res = await controller.listCategories('tenant-1')

    expect(mockService.listCategories).toHaveBeenCalledWith('tenant-1')
    expect(res).toEqual([])
  })

  it('should create article on POST /api/kb/articles', async () => {
    const art: KnowledgeBaseArticle = {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: '00000000-0000-0000-0000-000000000001',
      title: 'Guía de Inicio',
      slug: 'guia-de-inicio',
      contentMarkdown: '# Bienvenido',
      isPublished: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0,
      tags: [],
      authorName: 'Soporte',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockService.createArticle.mockResolvedValue(art)

    const res = await controller.createArticle({ title: 'Guía de Inicio', contentMarkdown: '# Bienvenido' }, 'tenant-1')

    expect(res.title).toBe('Guía de Inicio')
    expect(mockService.createArticle).toHaveBeenCalled()
  })

  it('should get portal overview on GET /api/kb/portal/overview/:contactId', async () => {
    const overview: CustomerPortalOverview = {
      contactId: '00000000-0000-0000-0000-000000000001',
      contactName: 'Carlos',
      openTicketsCount: 0,
      activeQuotesCount: 1,
      activeContractsCount: 1,
      featuredArticles: [],
    }
    mockService.getPortalOverview.mockResolvedValue(overview)

    const res = await controller.getPortalOverview(overview.contactId, 'tenant-1')

    expect(mockService.getPortalOverview).toHaveBeenCalledWith(overview.contactId, 'tenant-1')
    expect(res.contactName).toBe('Carlos')
  })
})
