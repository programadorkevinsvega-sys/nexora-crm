import { KbCategory } from '../../domain/entities/kb-category.entity'
import { KbArticle } from '../../domain/entities/kb-article.entity'
import { CustomerPortalOverview } from '../../domain/entities/portal-overview.entity'

describe('KbCategory entity', () => {
  it('1. create() — generates id, slug, and default values', () => {
    const cat = KbCategory.create({
      tenantId: 'tenant-1',
      name: 'Getting Started',
    })

    expect(cat.id).toBeDefined()
    expect(cat.slug).toBe('getting-started')
    expect(cat.icon).toBe('book-open')
    expect(cat.sortOrder).toBe(0)
    expect(cat.isPublic).toBe(true)
    expect(cat.articlesCount).toBe(0)
    expect(cat.createdAt).toBeInstanceOf(Date)
  })

  it('2. create() — isPublic flag is honoured when set to false', () => {
    const cat = KbCategory.create({
      tenantId: 'tenant-1',
      name: 'Internal Docs',
      isPublic: false,
    })

    expect(cat.isPublic).toBe(false)
    expect(cat.name).toBe('Internal Docs')
  })

  it('3. create() — custom slug overrides auto-generated one', () => {
    const cat = KbCategory.create({
      tenantId: 'tenant-1',
      name: 'Some Name',
      slug: 'my-custom-slug',
      sortOrder: 5,
      icon: 'star',
    })

    expect(cat.slug).toBe('my-custom-slug')
    expect(cat.sortOrder).toBe(5)
    expect(cat.icon).toBe('star')
  })
})

describe('KbArticle entity', () => {
  it('4. create() — generates id, slug, and default values', () => {
    const art = KbArticle.create({
      tenantId: 'tenant-1',
      title: 'How To Install',
      contentMarkdown: '## Steps here',
    })

    expect(art.id).toBeDefined()
    expect(art.slug).toBe('how-to-install')
    expect(art.isPublished).toBe(true)
    expect(art.helpfulVotes).toBe(0)
    expect(art.unhelpfulVotes).toBe(0)
    expect(art.viewCount).toBe(0)
    expect(art.tags).toEqual([])
    expect(art.authorName).toBe('Equipo de Soporte')
    expect(art.createdAt).toBeInstanceOf(Date)
  })

  it('5. create() — isPublished=false and custom tags are respected', () => {
    const art = KbArticle.create({
      tenantId: 'tenant-1',
      title: 'Draft Article',
      contentMarkdown: 'WIP',
      isPublished: false,
      tags: ['draft', 'review'],
      authorName: 'Admin',
    })

    expect(art.isPublished).toBe(false)
    expect(art.tags).toEqual(['draft', 'review'])
    expect(art.authorName).toBe('Admin')
  })

  it('6. create() — categoryId and categoryName are stored correctly', () => {
    const art = KbArticle.create({
      tenantId: 'tenant-1',
      title: 'FAQ Article',
      contentMarkdown: '## Answer',
      categoryId: 'cat-42',
      categoryName: 'FAQ',
      summary: 'Quick answers',
    })

    expect(art.categoryId).toBe('cat-42')
    expect(art.categoryName).toBe('FAQ')
    expect(art.summary).toBe('Quick answers')
  })
})

describe('CustomerPortalOverview entity', () => {
  it('7. constructor — stores all properties correctly', () => {
    const article = KbArticle.create({
      tenantId: 'tenant-1',
      title: 'Help Article',
      contentMarkdown: '# Help',
    })

    const overview = new CustomerPortalOverview(
      'contact-1',
      'Ana García',
      'ana@example.com',
      'Acme Corp',
      3,
      2,
      1,
      [article],
    )

    expect(overview.contactId).toBe('contact-1')
    expect(overview.contactName).toBe('Ana García')
    expect(overview.contactEmail).toBe('ana@example.com')
    expect(overview.companyName).toBe('Acme Corp')
    expect(overview.openTicketsCount).toBe(3)
    expect(overview.activeQuotesCount).toBe(2)
    expect(overview.activeContractsCount).toBe(1)
    expect(overview.featuredArticles).toHaveLength(1)
    expect(overview.featuredArticles[0]).toBeInstanceOf(KbArticle)
  })

  it('8. constructor — handles null email and companyName', () => {
    const overview = new CustomerPortalOverview(
      'contact-2',
      'Bob',
      null,
      null,
      0,
      0,
      0,
      [],
    )

    expect(overview.contactEmail).toBeNull()
    expect(overview.companyName).toBeNull()
    expect(overview.featuredArticles).toEqual([])
  })
})
