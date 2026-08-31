import { Injectable } from '@nestjs/common'
import { eq, and, sql, desc, ilike, or } from 'drizzle-orm'
import {
  getDb,
  knowledgeBaseCategories,
  knowledgeBaseArticles,
  contacts,
  companies,
  supportTickets,
  quotes,
  contracts,
} from '@crm/database'
import { KnowledgeBaseRepository } from '../domain/repositories/knowledge-base.repository'
import { KbCategory } from '../domain/entities/kb-category.entity'
import { KbArticle } from '../domain/entities/kb-article.entity'
import { CustomerPortalOverview } from '../domain/entities/portal-overview.entity'

@Injectable()
export class DrizzleKnowledgeBaseRepository extends KnowledgeBaseRepository {
  private get db() {
    return getDb()
  }

  async listCategories(tenantId: string): Promise<KbCategory[]> {
    const rows = await this.db
      .select()
      .from(knowledgeBaseCategories)
      .where(eq(knowledgeBaseCategories.tenantId, tenantId))
      .orderBy(knowledgeBaseCategories.sortOrder)

    const categories: KbCategory[] = []
    for (const r of rows) {
      const artCount = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(knowledgeBaseArticles)
        .where(
          and(
            eq(knowledgeBaseArticles.tenantId, tenantId),
            eq(knowledgeBaseArticles.categoryId, r.id),
            eq(knowledgeBaseArticles.isPublished, true),
          ),
        )

      categories.push(
        new KbCategory(
          r.id,
          r.tenantId,
          r.name,
          r.slug,
          r.description,
          r.icon ?? 'book-open',
          r.sortOrder,
          r.isPublic,
          artCount[0]?.count ?? 0,
          r.createdAt,
          r.updatedAt,
        ),
      )
    }
    return categories
  }

  async createCategory(tenantId: string, category: KbCategory): Promise<KbCategory> {
    await this.db.insert(knowledgeBaseCategories).values({
      id: category.id,
      tenantId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      sortOrder: category.sortOrder,
      isPublic: category.isPublic,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })
    return category
  }

  async listArticles(
    tenantId: string,
    filters?: { categoryId?: string; query?: string; publicOnly?: boolean },
  ): Promise<KbArticle[]> {
    const conditions = [eq(knowledgeBaseArticles.tenantId, tenantId)]

    if (filters?.publicOnly !== false) {
      conditions.push(eq(knowledgeBaseArticles.isPublished, true))
    }
    if (filters?.categoryId) {
      conditions.push(eq(knowledgeBaseArticles.categoryId, filters.categoryId))
    }
    if (filters?.query) {
      const q = `%${filters.query}%`
      conditions.push(
        or(
          ilike(knowledgeBaseArticles.title, q),
          ilike(knowledgeBaseArticles.summary, q),
          ilike(knowledgeBaseArticles.contentMarkdown, q),
        )!,
      )
    }

    const rows = await this.db
      .select()
      .from(knowledgeBaseArticles)
      .where(and(...conditions))
      .orderBy(desc(knowledgeBaseArticles.createdAt))

    const categories = await this.db.select().from(knowledgeBaseCategories).where(eq(knowledgeBaseCategories.tenantId, tenantId))
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

    return rows.map(
      (r) =>
        new KbArticle(
          r.id,
          r.tenantId,
          r.categoryId,
          r.categoryId ? categoryMap.get(r.categoryId) ?? null : null,
          r.title,
          r.slug,
          r.summary,
          r.contentMarkdown,
          r.isPublished,
          r.viewCount,
          r.helpfulVotes,
          r.unhelpfulVotes,
          (r.tags as string[]) ?? [],
          r.authorName ?? 'Equipo de Soporte',
          r.createdAt,
          r.updatedAt,
        ),
    )
  }

  async getArticle(tenantId: string, idOrSlug: string): Promise<KbArticle | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    const condition = isUuid
      ? and(eq(knowledgeBaseArticles.tenantId, tenantId), eq(knowledgeBaseArticles.id, idOrSlug))
      : and(eq(knowledgeBaseArticles.tenantId, tenantId), eq(knowledgeBaseArticles.slug, idOrSlug))

    const rows = await this.db.select().from(knowledgeBaseArticles).where(condition).limit(1)
    if (rows.length === 0) return null

    const r = rows[0]

    // Increment view count asynchronously
    await this.db
      .update(knowledgeBaseArticles)
      .set({ viewCount: r.viewCount + 1 })
      .where(eq(knowledgeBaseArticles.id, r.id))

    let categoryName: string | null = null
    if (r.categoryId) {
      const cat = await this.db.select().from(knowledgeBaseCategories).where(eq(knowledgeBaseCategories.id, r.categoryId)).limit(1)
      if (cat.length > 0) categoryName = cat[0].name
    }

    return new KbArticle(
      r.id,
      r.tenantId,
      r.categoryId,
      categoryName,
      r.title,
      r.slug,
      r.summary,
      r.contentMarkdown,
      r.isPublished,
      r.viewCount + 1,
      r.helpfulVotes,
      r.unhelpfulVotes,
      (r.tags as string[]) ?? [],
      r.authorName ?? 'Equipo de Soporte',
      r.createdAt,
      r.updatedAt,
    )
  }

  async createArticle(tenantId: string, article: KbArticle): Promise<KbArticle> {
    await this.db.insert(knowledgeBaseArticles).values({
      id: article.id,
      tenantId,
      categoryId: article.categoryId,
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      contentMarkdown: article.contentMarkdown,
      isPublished: article.isPublished,
      viewCount: article.viewCount,
      helpfulVotes: article.helpfulVotes,
      unhelpfulVotes: article.unhelpfulVotes,
      tags: article.tags,
      authorName: article.authorName,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    })
    return article
  }

  async voteArticle(tenantId: string, articleId: string, isHelpful: boolean): Promise<KbArticle | null> {
    const r = await this.getArticle(tenantId, articleId)
    if (!r) return null

    const helpfulVotes = isHelpful ? r.helpfulVotes + 1 : r.helpfulVotes
    const unhelpfulVotes = !isHelpful ? r.unhelpfulVotes + 1 : r.unhelpfulVotes

    await this.db
      .update(knowledgeBaseArticles)
      .set({ helpfulVotes, unhelpfulVotes })
      .where(eq(knowledgeBaseArticles.id, articleId))

    return new KbArticle(
      r.id,
      r.tenantId,
      r.categoryId,
      r.categoryName,
      r.title,
      r.slug,
      r.summary,
      r.contentMarkdown,
      r.isPublished,
      r.viewCount,
      helpfulVotes,
      unhelpfulVotes,
      r.tags,
      r.authorName,
      r.createdAt,
      r.updatedAt,
    )
  }

  async getPortalOverview(tenantId: string, contactId: string): Promise<CustomerPortalOverview> {
    const contactRows = await this.db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1)
    const contact = contactRows[0]
    const contactName = contact ? `${contact.firstName} ${contact.lastName ?? ''}`.trim() : 'Cliente'
    const contactEmail = contact ? contact.email : null

    let companyName: string | null = null
    if (contact?.companyId) {
      const comp = await this.db.select().from(companies).where(eq(companies.id, contact.companyId)).limit(1)
      if (comp.length > 0) companyName = comp[0].name
    }

    const [ticketsList, contractsList, featuredArticles] = await Promise.all([
      this.db.select().from(supportTickets).where(eq(supportTickets.contactId, contactId)),
      this.db.select().from(contracts).where(eq(contracts.tenantId, tenantId)),
      this.listArticles(tenantId, { publicOnly: true }),
    ])

    const openTicketsCount = ticketsList.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length

    return new CustomerPortalOverview(
      contactId,
      contactName,
      contactEmail,
      companyName,
      openTicketsCount,
      1,
      contractsList.length,
      featuredArticles.slice(0, 4),
    )
  }
}
