export class ListCategoriesQuery {
  constructor(readonly tenantId: string) {}
}

export class ListArticlesQuery {
  constructor(
    readonly tenantId: string,
    readonly categoryId?: string,
    readonly query?: string,
    readonly publicOnly?: boolean,
  ) {}
}

export class GetArticleQuery {
  constructor(readonly tenantId: string, readonly idOrSlug: string) {}
}

export class GetPortalOverviewQuery {
  constructor(readonly tenantId: string, readonly contactId: string) {}
}
