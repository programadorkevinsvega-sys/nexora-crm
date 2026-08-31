import { KbArticle } from './kb-article.entity'

export class CustomerPortalOverview {
  constructor(
    readonly contactId: string,
    readonly contactName: string,
    readonly contactEmail: string | null,
    readonly companyName: string | null,
    readonly openTicketsCount: number,
    readonly activeQuotesCount: number,
    readonly activeContractsCount: number,
    readonly featuredArticles: KbArticle[],
  ) {}
}
