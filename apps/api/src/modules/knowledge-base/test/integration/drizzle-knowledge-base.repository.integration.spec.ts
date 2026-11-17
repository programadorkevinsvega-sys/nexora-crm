import { DrizzleKnowledgeBaseRepository } from '../../infrastructure/drizzle-knowledge-base.repository'
import { KbCategory } from '../../domain/entities/kb-category.entity'
import { KbArticle } from '../../domain/entities/kb-article.entity'
import * as dbModule from '@crm/database'

const TENANT = 'tenant-test-1'
const NOW = new Date('2026-01-01T00:00:00Z')

const makeCategoryRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'cat-1',
  tenantId: TENANT,
  name: 'Getting Started',
  slug: 'getting-started',
  description: 'Intro articles',
  icon: 'book-open',
  sortOrder: 0,
  isPublic: true,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
})

const makeArticleRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'art-1',
  tenantId: TENANT,
  categoryId: 'cat-1',
  title: 'How to use the CRM',
  slug: 'how-to-use-the-crm',
  summary: 'A quick intro',
  contentMarkdown: '# Hello World',
  isPublished: true,
  viewCount: 10,
  helpfulVotes: 5,
  unhelpfulVotes: 1,
  tags: ['intro', 'crm'],
  authorName: 'Soporte',
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
})

describe('DrizzleKnowledgeBaseRepository — Integration', () => {
  let repository: DrizzleKnowledgeBaseRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: jest.fn(),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleKnowledgeBaseRepository()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ───────────────────────────── listCategories ──────────────────────────────

  it('1. listCategories — returns mapped KbCategory array with article counts', async () => {
    let selectCall = 0
    mockDb.select.mockImplementation(() => {
      selectCall++
      if (selectCall === 1) {
        // categories query — needs .orderBy()
        const chain: any = {}
        chain.from = jest.fn().mockReturnValue(chain)
        chain.where = jest.fn().mockReturnValue(chain)
        chain.orderBy = jest.fn().mockResolvedValue([makeCategoryRow()])
        return chain
      }
      // count query per category — .from().where() is the terminal step
      const chain: any = {}
      chain.from = jest.fn().mockReturnValue(chain)
      chain.where = jest.fn().mockResolvedValue([{ count: 3 }])
      return chain
    })

    const result = await repository.listCategories(TENANT)

    expect(result).toHaveLength(1)
    expect(result[0]).toBeInstanceOf(KbCategory)
    expect(result[0].name).toBe('Getting Started')
    expect(result[0].articlesCount).toBe(3)
    expect(result[0].tenantId).toBe(TENANT)
  })

  it('2. listCategories — empty tenant returns []', async () => {
    mockDb.select.mockImplementation(() => {
      const chain: any = {}
      chain.from = jest.fn().mockReturnValue(chain)
      chain.where = jest.fn().mockReturnValue(chain)
      chain.orderBy = jest.fn().mockResolvedValue([])
      return chain
    })

    const result = await repository.listCategories('tenant-nobody')
    expect(result).toEqual([])
  })

  // ─────────────────────────── createCategory ────────────────────────────────

  it('3. createCategory — inserts and returns the category', async () => {
    const category = KbCategory.create({ tenantId: TENANT, name: 'FAQ' })
    const valuesMock = jest.fn().mockResolvedValue(undefined)
    mockDb.insert.mockReturnValue({ values: valuesMock })

    const result = await repository.createCategory(TENANT, category)

    expect(mockDb.insert).toHaveBeenCalled()
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT, name: 'FAQ' }),
    )
    expect(result).toBe(category)
  })

  // ─────────────────────────── listArticles ──────────────────────────────────

  it('4. listArticles — no filters returns published articles', async () => {
    let selectCall = 0
    mockDb.select.mockImplementation(() => {
      selectCall++
      const chain: any = {}
      chain.from = jest.fn().mockReturnValue(chain)
      chain.where = jest.fn().mockReturnValue(chain)
      if (selectCall === 1) {
        chain.orderBy = jest.fn().mockResolvedValue([makeArticleRow()])
      } else {
        // categories for name mapping — plain select().from().where()
        chain.then = (res: any) => Promise.resolve([makeCategoryRow()]).then(res)
      }
      return chain
    })

    const result = await repository.listArticles(TENANT)

    expect(result).toHaveLength(1)
    expect(result[0]).toBeInstanceOf(KbArticle)
    expect(result[0].title).toBe('How to use the CRM')
    expect(result[0].isPublished).toBe(true)
  })

  it('5. listArticles — with search query passes ilike filter', async () => {
    let selectCall = 0
    mockDb.select.mockImplementation(() => {
      selectCall++
      const chain: any = {}
      chain.from = jest.fn().mockReturnValue(chain)
      chain.where = jest.fn().mockReturnValue(chain)
      if (selectCall === 1) {
        chain.orderBy = jest.fn().mockResolvedValue([makeArticleRow()])
      } else {
        chain.then = (res: any) => Promise.resolve([]).then(res)
      }
      return chain
    })

    const result = await repository.listArticles(TENANT, { query: 'CRM' })

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('How to use the CRM')
  })

  // ──────────────────────────── getArticle ───────────────────────────────────

  it('6. getArticle — found returns KbArticle', async () => {
    let selectCall = 0
    mockDb.select.mockImplementation(() => {
      selectCall++
      const chain: any = {}
      chain.from = jest.fn().mockReturnValue(chain)
      chain.where = jest.fn().mockReturnValue(chain)
      chain.limit = jest.fn().mockResolvedValue(
        selectCall === 1 ? [makeArticleRow()] : [],
      )
      return chain
    })

    const result = await repository.getArticle(TENANT, 'art-1')

    expect(result).not.toBeNull()
    expect(result).toBeInstanceOf(KbArticle)
    expect(result?.id).toBe('art-1')
    expect(result?.title).toBe('How to use the CRM')
  })

  it('7. getArticle — not found returns null', async () => {
    mockDb.select.mockImplementation(() => {
      const chain: any = {}
      chain.from = jest.fn().mockReturnValue(chain)
      chain.where = jest.fn().mockReturnValue(chain)
      chain.limit = jest.fn().mockResolvedValue([])
      return chain
    })

    const result = await repository.getArticle(TENANT, 'non-existent-id')
    expect(result).toBeNull()
  })

  // ──────────────────────────── voteArticle ──────────────────────────────────

  it('8. voteArticle — helpful=true increments helpfulVotes', async () => {
    const articleRow = makeArticleRow({ helpfulVotes: 5, unhelpfulVotes: 1 })
    let selectCall = 0
    mockDb.select.mockImplementation(() => {
      selectCall++
      const chain: any = {}
      chain.from = jest.fn().mockReturnValue(chain)
      chain.where = jest.fn().mockReturnValue(chain)
      chain.limit = jest.fn().mockResolvedValue(
        selectCall === 1 ? [articleRow] : [],
      )
      return chain
    })

    const whereMock = jest.fn().mockResolvedValue(undefined)
    const setMock = jest.fn().mockReturnValue({ where: whereMock })
    mockDb.update.mockReturnValue({ set: setMock })

    const result = await repository.voteArticle(TENANT, 'art-1', true)

    expect(result).not.toBeNull()
    expect(result?.helpfulVotes).toBe(6)
    expect(result?.unhelpfulVotes).toBe(1)
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ helpfulVotes: 6, unhelpfulVotes: 1 }),
    )
  })

  // ────────────────────────── createArticle ──────────────────────────────────

  it('9. createArticle — inserts and returns article', async () => {
    const article = KbArticle.create({
      tenantId: TENANT,
      title: 'New Article',
      contentMarkdown: '## Content here',
      categoryId: 'cat-1',
    })
    const valuesMock = jest.fn().mockResolvedValue(undefined)
    mockDb.insert.mockReturnValue({ values: valuesMock })

    const result = await repository.createArticle(TENANT, article)

    expect(mockDb.insert).toHaveBeenCalled()
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT, title: 'New Article' }),
    )
    expect(result).toBe(article)
  })

  // ────────────────────────── getPortalOverview ───────────────────────────────

  it('10. getPortalOverview — returns overview with ticket and contract counts', async () => {
    let selectCall = 0
    mockDb.select.mockImplementation(() => {
      selectCall++
      const chain: any = {}
      chain.from = jest.fn().mockReturnValue(chain)
      chain.where = jest.fn().mockReturnValue(chain)

      if (selectCall === 1) {
        // contacts.select().from().where().limit()
        chain.limit = jest.fn().mockResolvedValue([
          { id: 'contact-1', firstName: 'Ana', lastName: 'García', email: 'ana@example.com', companyId: null },
        ])
      } else if (selectCall === 2) {
        // supportTickets — parallel Promise.all element
        chain.then = (res: any) =>
          Promise.resolve([{ status: 'OPEN' }, { status: 'RESOLVED' }]).then(res)
      } else if (selectCall === 3) {
        // contracts — parallel Promise.all element
        chain.then = (res: any) =>
          Promise.resolve([{ id: 'c1' }, { id: 'c2' }]).then(res)
      } else if (selectCall === 4) {
        // listArticles — articles query
        chain.orderBy = jest.fn().mockResolvedValue([makeArticleRow()])
      } else {
        // listArticles — categories for name mapping
        chain.then = (res: any) => Promise.resolve([]).then(res)
      }

      return chain
    })

    const result = await repository.getPortalOverview(TENANT, 'contact-1')

    expect(result.contactId).toBe('contact-1')
    expect(result.contactName).toBe('Ana García')
    expect(result.contactEmail).toBe('ana@example.com')
    expect(result.openTicketsCount).toBe(1)
    expect(result.activeContractsCount).toBe(2)
    expect(result.featuredArticles).toHaveLength(1)
  })
})
