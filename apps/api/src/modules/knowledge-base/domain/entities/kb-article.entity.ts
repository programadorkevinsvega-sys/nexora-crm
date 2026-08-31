export class KbArticle {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly categoryId: string | null,
    readonly categoryName: string | null,
    readonly title: string,
    readonly slug: string,
    readonly summary: string | null,
    readonly contentMarkdown: string,
    readonly isPublished: boolean,
    readonly viewCount: number,
    readonly helpfulVotes: number,
    readonly unhelpfulVotes: number,
    readonly tags: string[],
    readonly authorName: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    title: string
    contentMarkdown: string
    categoryId?: string | null
    categoryName?: string | null
    slug?: string
    summary?: string | null
    isPublished?: boolean
    tags?: string[]
    authorName?: string
  }): KbArticle {
    const slug = props.slug || props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const now = new Date()
    return new KbArticle(
      crypto.randomUUID(),
      props.tenantId,
      props.categoryId ?? null,
      props.categoryName ?? null,
      props.title,
      slug,
      props.summary ?? null,
      props.contentMarkdown,
      props.isPublished ?? true,
      0,
      0,
      0,
      props.tags ?? [],
      props.authorName ?? 'Equipo de Soporte',
      now,
      now,
    )
  }
}
