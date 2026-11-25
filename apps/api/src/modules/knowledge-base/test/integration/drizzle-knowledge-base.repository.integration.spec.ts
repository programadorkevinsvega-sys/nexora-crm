import { DrizzleKnowledgeBaseRepository } from '../../infrastructure/drizzle-knowledge-base.repository'
import { KbCategory } from '../../domain/entities/kb-category.entity'
import { KbArticle } from '../../domain/entities/kb-article.entity'
import * as dbModule from '@crm/database'

const TENANT = 'tenant-test-1'
const NOW = new Date('2026-01-01T00:00:00Z')

type QueryRow = Record<string, unknown>

interface QueryChain extends PromiseLike<QueryRow[]> {
  from: jest.MockedFunction<(table: unknown) => QueryChain>
  where: jest.MockedFunction<(condition: unknown) => QueryChain | Promise<QueryRow[]>>
  orderBy: jest.MockedFunction<(...args: unknown[]) => Promise<QueryRow[]>>
  limit: jest.MockedFunction<(count: number) => Promise<QueryRow[]>>
  setResult(rows: QueryRow[]): void
}

function createQueryChain(initialRows: QueryRow[] = []): QueryChain {
  let rows = initialRows
  const chain: QueryChain = {
    from: jest.fn<QueryChain, [unknown]>().mockImplementation(() => chain),
    where: jest.fn<QueryChain | Promise<QueryRow[]>, [unknown]>().mockImplementation(() => chain),
    orderBy: jest.fn<Promise<QueryRow[]>, unknown[]>().mockImplementation(async () => rows),
    limit: jest.fn<Promise<QueryRow[]>, [number]>().mockImplementation(async () => rows),
    setResult(nextRows: QueryRow[]) { rows = nextRows },
    then<TResult1 = QueryRow[], TResult2 = never>(
      onfulfilled?: ((value: QueryRow[]) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
      return Promise.resolve(rows).then(onfulfilled, onrejected)
    },
  }
  return chain
}

type ValuesMock = jest.MockedFunction<(values: unknown) => Promise<unknown>>
type WhereUpdateMock = jest.MockedFunction<(condition: unknown) => Promise<unknown>>
type MockDatabase = {
  select: jest.MockedFunction<() => QueryChain>
  insert: jest.MockedFunction<() => { values: ValuesMock }>
  update: jest.MockedFunction<() => { set: jest.MockedFunction<(values: unknown) => { where: WhereUpdateMock }> }>
}


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
  let mockDb: MockDatabase

  beforeEach(() => {
    mockDb = {
      select: jest.fn<QueryChain, []>(),
      insert: jest.fn<{ values: ValuesMock }, []>().mockReturnValue({
        values: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue(undefined),
      }),
      update: jest.fn<{ set: jest.MockedFunction<(values: unknown) => { where: WhereUpdateMock }> }, []>().mockReturnValue({
        set: jest.fn<{ where: WhereUpdateMock }, [unknown]>().mockReturnValue({
          where: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb as unknown as ReturnType<typeof dbModule.getDb>)
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
        const chain = createQueryChain()
        chain.from.mockReturnValue(chain)
        chain.where.mockReturnValue(chain)
        chain.setResult([makeCategoryRow()])
        chain.orderBy.mockResolvedValue([makeCategoryRow()])
        return chain
      }
      // count query per category — .from().where() is the terminal step
      const chain = createQueryChain()
      chain.from.mockReturnValue(chain)
      chain.where.mockImplementation(() => Promise.resolve([{ count: 3 }]))
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
      const chain = createQueryChain()
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.orderBy.mockResolvedValue([])
      return chain
    })

    const result = await repository.listCategories('tenant-nobody')
    expect(result).toEqual([])
  })

  // ─────────────────────────── createCategory ────────────────────────────────

  it('3. createCategory — inserts and returns the category', async () => {
    const category = KbCategory.create({ tenantId: TENANT, name: 'FAQ' })
    const valuesMock = jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue(undefined)
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
      const chain = createQueryChain()
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      if (selectCall === 1) {
        chain.orderBy.mockResolvedValue([makeArticleRow()])
      } else {
        // categories for name mapping — plain select().from().where()
        chain.setResult([makeCategoryRow()])
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
      const chain = createQueryChain()
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      if (selectCall === 1) {
        chain.orderBy.mockResolvedValue([makeArticleRow()])
      } else {
        chain.setResult([])
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
      const chain = createQueryChain()
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.limit.mockResolvedValue(
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
      const chain = createQueryChain()
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.limit.mockResolvedValue([])
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
      const chain = createQueryChain()
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.limit.mockResolvedValue(
        selectCall === 1 ? [articleRow] : [],
      )
      return chain
    })

    const whereMock = jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue(undefined)
    const setMock = jest.fn<{ where: WhereUpdateMock }, [unknown]>().mockReturnValue({ where: whereMock })
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

  it('10. getPortalOverview — returns only this contact company active contract count', async () => {
    let selectCall = 0
    mockDb.select.mockImplementation(() => {
      selectCall++
      const chain = createQueryChain()
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)

      if (selectCall === 1) {
        // Contact identity must be scoped by both contact ID and tenant ID.
        chain.limit.mockResolvedValue([
          { id: 'contact-1', firstName: 'Ana', lastName: 'García', email: 'ana@example.com', companyId: 'company-1' },
        ])
      } else if (selectCall === 2) {
        // Company lookup is also tenant-scoped.
        chain.limit.mockResolvedValue([
          { id: 'company-1', tenantId: TENANT, name: 'Empresa Ana' },
        ])
      } else if (selectCall === 3) {
        // Tickets are scoped by tenant and contact.
        chain.setResult([{ status: 'OPEN' }, { status: 'RESOLVED' }])
      } else if (selectCall === 4) {
        // Only ACTIVE contracts for this contact's company are requested.
        chain.setResult([{ id: 'c1' }, { id: 'c2' }])
      } else if (selectCall === 5) {
        // Featured published articles.
        chain.orderBy.mockResolvedValue([makeArticleRow()])
      } else {
        // Category-name lookup used by the article mapper.
        chain.setResult([])
      }

      return chain
    })

    const result = await repository.getPortalOverview(TENANT, 'contact-1')

    expect(result.contactId).toBe('contact-1')
    expect(result.contactName).toBe('Ana García')
    expect(result.contactEmail).toBe('ana@example.com')
    expect(result.companyName).toBe('Empresa Ana')
    expect(result.openTicketsCount).toBe(1)
    expect(result.activeContractsCount).toBe(2)
    expect(result.featuredArticles).toHaveLength(1)
  })
})
