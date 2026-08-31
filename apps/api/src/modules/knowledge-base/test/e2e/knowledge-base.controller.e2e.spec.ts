import { Test, TestingModule } from '@nestjs/testing'
import { KnowledgeBaseController } from '../../interfaces/http/knowledge-base.controller'
import {
  CreateCategoryHandler,
  CreateArticleHandler,
  VoteArticleHandler,
} from '../../application/commands/kb.handlers'
import {
  ListCategoriesHandler,
  ListArticlesHandler,
  GetArticleHandler,
  GetPortalOverviewHandler,
} from '../../application/queries/kb.handlers'
import { KbCategory } from '../../domain/entities/kb-category.entity'
import { KbArticle } from '../../domain/entities/kb-article.entity'
import { CustomerPortalOverview } from '../../domain/entities/portal-overview.entity'

// ───────────────────────────────────────────────────────────────
// E2E: KnowledgeBaseController — NestJS TestingModule approach
// Tests the full HTTP controller layer against mocked handlers
// ───────────────────────────────────────────────────────────────
describe('KnowledgeBaseController (e2e - NestJS TestingModule)', () => {
  let controller: KnowledgeBaseController

  const TENANT = '00000000-0000-0000-0000-000000000001'
  const CAT_ID = '00000000-0000-0000-0000-000000000010'
  const ART_ID = '00000000-0000-0000-0000-000000000020'
  const CONTACT_ID = '00000000-0000-0000-0000-000000000030'

  const mockListCatsHandler = { execute: jest.fn() }
  const mockCreateCatHandler = { execute: jest.fn() }
  const mockListArtsHandler = { execute: jest.fn() }
  const mockGetArtHandler = { execute: jest.fn() }
  const mockCreateArtHandler = { execute: jest.fn() }
  const mockVoteArtHandler = { execute: jest.fn() }
  const mockPortalHandler = { execute: jest.fn() }

  const fakeCategory = new KbCategory(
    CAT_ID, TENANT, 'Primeros Pasos', 'primeros-pasos',
    'Guías de inicio rápido para nuevos usuarios',
    'rocket', 1, true, 5, new Date(), new Date(),
  )

  // KbArticle: id, tenantId, categoryId, categoryName, title, slug, summary,
  //            contentMarkdown, isPublished, viewCount, helpfulVotes, unhelpfulVotes, tags, authorName, createdAt, updatedAt
  const fakeArticle = new KbArticle(
    ART_ID, TENANT, CAT_ID, 'Primeros Pasos',
    'Cómo conectar tu cuenta de email', 'como-conectar-email',
    'Guía paso a paso para integrar email',
    '## Introducción\nConecta tu cuenta de Gmail o Outlook en 3 pasos...',
    true, 234, 47, 3, ['email', 'configuración'], 'Equipo Nexus CRM',
    new Date(), new Date(),
  )

  // CustomerPortalOverview: contactId, contactName, contactEmail, companyName,
  //                         openTicketsCount, activeQuotesCount, activeContractsCount, featuredArticles
  const fakePortalOverview = new CustomerPortalOverview(
    CONTACT_ID, 'Carlos Mendoza', 'carlos@empresa.com', 'Acme Corp',
    1, 2, 1, [fakeArticle],
  )

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeBaseController],
      providers: [
        { provide: ListCategoriesHandler, useValue: mockListCatsHandler },
        { provide: CreateCategoryHandler, useValue: mockCreateCatHandler },
        { provide: ListArticlesHandler, useValue: mockListArtsHandler },
        { provide: GetArticleHandler, useValue: mockGetArtHandler },
        { provide: CreateArticleHandler, useValue: mockCreateArtHandler },
        { provide: VoteArticleHandler, useValue: mockVoteArtHandler },
        { provide: GetPortalOverviewHandler, useValue: mockPortalHandler },
      ],
    }).compile()

    controller = module.get<KnowledgeBaseController>(KnowledgeBaseController)
    jest.clearAllMocks()
  })

  // ── Categories ──────────────────────────────────────
  describe('GET /knowledge-base/categories', () => {
    it('should return a list of knowledge base categories', async () => {
      mockListCatsHandler.execute.mockResolvedValue([fakeCategory])

      const result = await controller.listCategories(TENANT)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Primeros Pasos')
      expect(result[0].articlesCount).toBe(5)
      expect(mockListCatsHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should return empty array when no categories exist', async () => {
      mockListCatsHandler.execute.mockResolvedValue([])

      const result = await controller.listCategories(TENANT)

      expect(result).toHaveLength(0)
    })
  })

  describe('POST /knowledge-base/categories', () => {
    it('should create a new category and return it', async () => {
      mockCreateCatHandler.execute.mockResolvedValue(fakeCategory)

      const result = await controller.createCategory(
        { name: 'Primeros Pasos', slug: 'primeros-pasos', isPublic: true },
        TENANT,
      )

      expect(result.id).toBe(CAT_ID)
      expect(result.slug).toBe('primeros-pasos')
      expect(mockCreateCatHandler.execute).toHaveBeenCalledTimes(1)
    })
  })

  // ── Articles ────────────────────────────────────────
  describe('GET /knowledge-base/articles', () => {
    it('should return published articles for a tenant', async () => {
      mockListArtsHandler.execute.mockResolvedValue([fakeArticle])

      const result = await controller.listArticles(undefined, undefined, undefined, TENANT)

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Cómo conectar tu cuenta de email')
      expect(result[0].helpfulVotes).toBe(47)
      expect(mockListArtsHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should filter by categoryId when provided', async () => {
      mockListArtsHandler.execute.mockResolvedValue([fakeArticle])

      const result = await controller.listArticles(CAT_ID, undefined, undefined, TENANT)

      expect(result[0].categoryId).toBe(CAT_ID)
      expect(mockListArtsHandler.execute).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: CAT_ID }),
      )
    })

    it('should filter by search query', async () => {
      mockListArtsHandler.execute.mockResolvedValue([fakeArticle])

      await controller.listArticles(undefined, 'email', undefined, TENANT)

      expect(mockListArtsHandler.execute).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'email' }),
      )
    })
  })

  describe('GET /knowledge-base/articles/:idOrSlug', () => {
    it('should return a single article by UUID', async () => {
      mockGetArtHandler.execute.mockResolvedValue(fakeArticle)

      const result = await controller.getArticle(ART_ID, TENANT)

      expect(result.id).toBe(ART_ID)
      expect(result.contentMarkdown).toContain('Introducción')
      expect(mockGetArtHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should return an article by slug', async () => {
      mockGetArtHandler.execute.mockResolvedValue(fakeArticle)

      const result = await controller.getArticle('como-conectar-email', TENANT)

      expect(result.slug).toBe('como-conectar-email')
    })
  })

  describe('POST /knowledge-base/articles', () => {
    it('should create a new article and return it', async () => {
      mockCreateArtHandler.execute.mockResolvedValue(fakeArticle)

      const result = await controller.createArticle(
        {
          title: 'Cómo conectar tu cuenta de email',
          contentMarkdown: '## Introducción\nConecta tu cuenta...',
          categoryId: CAT_ID,
          isPublished: true,
          tags: ['email', 'configuración'],
        },
        TENANT,
      )

      expect(result.title).toBe('Cómo conectar tu cuenta de email')
      expect(result.isPublished).toBe(true)
      expect(result.tags).toContain('email')
    })
  })

  describe('POST /knowledge-base/articles/:id/vote', () => {
    it('should record a helpful vote and return updated article', async () => {
      const updatedArticle = new KbArticle(
        ART_ID, TENANT, CAT_ID, 'Primeros Pasos',
        'Cómo conectar tu cuenta de email', 'como-conectar-email',
        'Guía paso a paso', '## Introducción\nConecta tu cuenta...',
        true, 235, 48, 3, ['email'], 'Equipo Nexus CRM', new Date(), new Date(),
      )
      mockVoteArtHandler.execute.mockResolvedValue(updatedArticle)

      const result = await controller.voteArticle(ART_ID, { isHelpful: true }, TENANT)

      expect(result.helpfulVotes).toBe(48)
      expect(mockVoteArtHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should record a not-helpful vote and increment unhelpfulVotes', async () => {
      const updatedArticle = new KbArticle(
        ART_ID, TENANT, CAT_ID, 'Primeros Pasos',
        'Cómo conectar tu cuenta de email', 'como-conectar-email',
        'Guía paso a paso', '## Introducción\nConecta tu cuenta...',
        true, 235, 47, 4, ['email'], 'Equipo Nexus CRM', new Date(), new Date(),
      )
      mockVoteArtHandler.execute.mockResolvedValue(updatedArticle)

      const result = await controller.voteArticle(ART_ID, { isHelpful: false }, TENANT)

      expect(result.unhelpfulVotes).toBe(4)
    })
  })

  // ── Customer Portal Overview ────────────────────────
  describe('GET /knowledge-base/portal/overview/:contactId', () => {
    it('should return customer portal overview with open tickets and active quotes', async () => {
      mockPortalHandler.execute.mockResolvedValue(fakePortalOverview)

      const result = await controller.getPortalOverview(CONTACT_ID, TENANT)

      expect(result.contactId).toBe(CONTACT_ID)
      expect(result.contactName).toBe('Carlos Mendoza')
      expect(result.openTicketsCount).toBe(1)
      expect(result.activeQuotesCount).toBe(2)
      expect(result.featuredArticles).toHaveLength(1)
      expect(mockPortalHandler.execute).toHaveBeenCalledTimes(1)
    })

    it('should return zero counts for a new contact with no history', async () => {
      const emptyOverview = new CustomerPortalOverview(
        CONTACT_ID, 'Ana Martínez', null, null,
        0, 0, 0, [],
      )
      mockPortalHandler.execute.mockResolvedValue(emptyOverview)

      const result = await controller.getPortalOverview(CONTACT_ID, TENANT)

      expect(result.openTicketsCount).toBe(0)
      expect(result.activeQuotesCount).toBe(0)
      expect(result.activeContractsCount).toBe(0)
      expect(result.featuredArticles).toHaveLength(0)
    })
  })
})
