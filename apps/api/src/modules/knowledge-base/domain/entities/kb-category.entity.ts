export class KbCategory {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly slug: string,
    readonly description: string | null,
    readonly icon: string,
    readonly sortOrder: number,
    readonly isPublic: boolean,
    readonly articlesCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    slug?: string
    description?: string | null
    icon?: string
    sortOrder?: number
    isPublic?: boolean
  }): KbCategory {
    const slug = props.slug || props.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const now = new Date()
    return new KbCategory(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      slug,
      props.description ?? null,
      props.icon ?? 'book-open',
      props.sortOrder ?? 0,
      props.isPublic ?? true,
      0,
      now,
      now,
    )
  }
}
