export class CreateCategoryCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly slug?: string,
    readonly description?: string,
    readonly icon?: string,
    readonly sortOrder?: number,
    readonly isPublic?: boolean,
  ) {}
}

export class CreateArticleCommand {
  constructor(
    readonly tenantId: string,
    readonly title: string,
    readonly contentMarkdown: string,
    readonly categoryId?: string,
    readonly slug?: string,
    readonly summary?: string,
    readonly isPublished?: boolean,
    readonly tags?: string[],
    readonly authorName?: string,
  ) {}
}

export class VoteArticleCommand {
  constructor(
    readonly tenantId: string,
    readonly articleId: string,
    readonly isHelpful: boolean,
  ) {}
}
