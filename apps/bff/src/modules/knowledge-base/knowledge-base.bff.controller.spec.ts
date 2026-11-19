import { NotFoundException } from '@nestjs/common'
import { KnowledgeBaseBffController } from './knowledge-base.bff.controller'
import { KnowledgeBaseBffService } from './knowledge-base.bff.service'
import type { KnowledgeBaseCategory, KnowledgeBaseArticle } from '@crm/contracts'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'

describe('KnowledgeBaseBffController', () => {
  let controller: KnowledgeBaseBffController
  let mockService: jest.Mocked<KnowledgeBaseBffService>

  const portalUser: AuthenticatedUser = {
    userId: '33333333-3333-4333-8333-333333333333',
    sub: '33333333-3333-4333-8333-333333333333',
    tenantId: '11111111-1111-4111-8111-111111111111',
    contactId: '22222222-2222-4222-8222-222222222222',
    customerPortal: true,
  }

  beforeEach(() => {
    mockService = {
      listCategories: jest.fn(),
      createCategory: jest.fn(),
      listArticles: jest.fn(),
      getArticle: jest.fn(),
      createArticle: jest.fn(),
      voteArticle: jest.fn(),
    } as unknown as jest.Mocked<KnowledgeBaseBffService>

    controller = new KnowledgeBaseBffController(mockService)
  })

  it('lists all categories for a normal CRM user', async () => {
    const categories = [
      { id: '1', tenantId: portalUser.tenantId, name: 'Publica', slug: 'publica', isPublic: true },
      { id: '2', tenantId: portalUser.tenantId, name: 'Interna', slug: 'interna', isPublic: false },
    ] as KnowledgeBaseCategory[]
    mockService.listCategories.mockResolvedValue(categories)

    const res = await controller.listCategories(portalUser.tenantId, {
      ...portalUser,
      customerPortal: false,
    })

    expect(mockService.listCategories).toHaveBeenCalledWith(portalUser.tenantId)
    expect(res).toHaveLength(2)
  })

  it('exposes only public categories to a customer portal identity', async () => {
    const categories = [
      { id: '1', tenantId: portalUser.tenantId, name: 'Publica', slug: 'publica', isPublic: true },
      { id: '2', tenantId: portalUser.tenantId, name: 'Interna', slug: 'interna', isPublic: false },
    ] as KnowledgeBaseCategory[]
    mockService.listCategories.mockResolvedValue(categories)

    const res = await controller.listCategories(portalUser.tenantId, portalUser)

    expect(res.map((category) => category.name)).toEqual(['Publica'])
  })

  it('forces public-only article queries for customer portal identities', async () => {
    mockService.listArticles.mockResolvedValue([])

    await controller.listArticles(undefined, undefined, 'false', portalUser.tenantId, portalUser)

    expect(mockService.listArticles).toHaveBeenCalledWith(
      { categoryId: undefined, query: undefined, publicOnly: true },
      portalUser.tenantId,
    )
  })

  it('filters published articles assigned to private categories for portal users', async () => {
    const articles = [
      { id: 'a-public', tenantId: portalUser.tenantId, categoryId: 'category-public', title: 'Public', isPublished: true },
      { id: 'a-private', tenantId: portalUser.tenantId, categoryId: 'category-private', title: 'Internal', isPublished: true },
      { id: 'a-uncategorized', tenantId: portalUser.tenantId, categoryId: null, title: 'General', isPublished: true },
    ] as KnowledgeBaseArticle[]
    mockService.listArticles.mockResolvedValue(articles)
    mockService.listCategories.mockResolvedValue([
      { id: 'category-public', tenantId: portalUser.tenantId, name: 'Pública', slug: 'publica', isPublic: true },
      { id: 'category-private', tenantId: portalUser.tenantId, name: 'Privada', slug: 'privada', isPublic: false },
    ] as KnowledgeBaseCategory[])

    const result = await controller.listArticles(
      undefined,
      undefined,
      'false',
      portalUser.tenantId,
      portalUser,
    )

    expect(result.map((article) => article.id)).toEqual(['a-public', 'a-uncategorized'])
  })

  it('does not expose published articles assigned to private categories by ID or slug', async () => {
    const article = {
      id: '44444444-4444-4444-8444-444444444444',
      tenantId: portalUser.tenantId,
      categoryId: 'category-private',
      title: 'Internal category article',
      slug: 'internal-category',
      contentMarkdown: 'not for customers',
      isPublished: true,
    } as KnowledgeBaseArticle
    mockService.getArticle.mockResolvedValue(article)
    mockService.listCategories.mockResolvedValue([
      { id: 'category-private', tenantId: portalUser.tenantId, name: 'Privada', slug: 'privada', isPublic: false },
    ] as KnowledgeBaseCategory[])

    await expect(
      controller.getArticle(article.slug, portalUser.tenantId, portalUser),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('does not expose unpublished articles to customer portal identities', async () => {
    const article = {
      id: '44444444-4444-4444-8444-444444444444',
      tenantId: portalUser.tenantId,
      title: 'Draft',
      slug: 'draft',
      contentMarkdown: 'internal',
      isPublished: false,
    } as KnowledgeBaseArticle
    mockService.getArticle.mockResolvedValue(article)

    await expect(
      controller.getArticle(article.slug, portalUser.tenantId, portalUser),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('allows published articles for customer portal identities', async () => {
    const article = {
      id: '44444444-4444-4444-8444-444444444444',
      tenantId: portalUser.tenantId,
      title: 'Published',
      slug: 'published',
      contentMarkdown: '# Public',
      isPublished: true,
    } as KnowledgeBaseArticle
    mockService.getArticle.mockResolvedValue(article)

    const res = await controller.getArticle(article.slug, portalUser.tenantId, portalUser)

    expect(res).toEqual(article)
  })
})
