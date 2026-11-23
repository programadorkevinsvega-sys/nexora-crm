import {
  CreateCategoryHandler,
  CreateArticleHandler,
  VoteArticleHandler,
} from '../../application/commands/kb.handlers'
import {
  GetPortalOverviewHandler,
} from '../../application/queries/kb.handlers'
import {
  CreateCategoryCommand,
  CreateArticleCommand,
  VoteArticleCommand,
} from '../../application/commands/kb.commands'
import {
  GetPortalOverviewQuery,
} from '../../application/queries/kb.queries'
import { KnowledgeBaseRepository } from '../../domain/repositories/knowledge-base.repository'
import { KbCategory } from '../../domain/entities/kb-category.entity'
import { KbArticle } from '../../domain/entities/kb-article.entity'
import { CustomerPortalOverview } from '../../domain/entities/portal-overview.entity'
import { NotFoundException } from '@nestjs/common'

describe('Knowledge Base Handlers', () => {
  let repo: jest.Mocked<KnowledgeBaseRepository>

  beforeEach(() => {
    repo = {
      listCategories: jest.fn(),
      createCategory: jest.fn(),
      listArticles: jest.fn(),
      getArticle: jest.fn(),
      createArticle: jest.fn(),
      voteArticle: jest.fn(),
      getPortalOverview: jest.fn(),
    }
  })

  it('CreateCategoryHandler should create category', async () => {
    const cat = KbCategory.create({ tenantId: 'tenant-1', name: 'Primeros Pasos' })
    repo.createCategory.mockResolvedValue(cat)

    const handler = new CreateCategoryHandler(repo)
    const res = await handler.execute(new CreateCategoryCommand('tenant-1', 'Primeros Pasos'))

    expect(res.name).toBe('Primeros Pasos')
    expect(res.slug).toBe('primeros-pasos')
    expect(repo.createCategory).toHaveBeenCalledTimes(1)
  })

  it('CreateArticleHandler should create article', async () => {
    const art = KbArticle.create({
      tenantId: 'tenant-1',
      title: 'Cómo configurar 2FA',
      contentMarkdown: 'Paso 1: Ve a Ajustes...',
    })
    repo.createArticle.mockResolvedValue(art)

    const handler = new CreateArticleHandler(repo)
    const res = await handler.execute(
      new CreateArticleCommand('tenant-1', 'Cómo configurar 2FA', 'Paso 1: Ve a Ajustes...'),
    )

    expect(res.title).toBe('Cómo configurar 2FA')
    expect(res.slug).toBe('c-mo-configurar-2fa')
    expect(repo.createArticle).toHaveBeenCalledTimes(1)
  })

  it('VoteArticleHandler should vote and throw if not found', async () => {
    repo.voteArticle.mockResolvedValue(null)
    const handler = new VoteArticleHandler(repo)

    await expect(handler.execute(new VoteArticleCommand('tenant-1', 'invalid', true))).rejects.toThrow(
      NotFoundException,
    )
  })

  it('GetPortalOverviewHandler should return overview', async () => {
    const overview = new CustomerPortalOverview(
      'contact-1',
      'Juan Perez',
      'juan@example.com',
      'Acme Inc',
      2,
      1,
      1,
      [],
    )
    repo.getPortalOverview.mockResolvedValue(overview)

    const handler = new GetPortalOverviewHandler(repo)
    const res = await handler.execute(new GetPortalOverviewQuery('tenant-1', 'contact-1'))

    expect(res.contactName).toBe('Juan Perez')
    expect(res.openTicketsCount).toBe(2)
  })
})
