export class Pagination {
  private constructor(
    public readonly cursor: string | null,
    public readonly limit: number,
  ) {
    if (limit < 1 || limit > 100) {
      throw new Error("Pagination limit must be between 1 and 100")
    }
  }

  static create(cursor: string | null = null, limit = 20): Pagination {
    return new Pagination(cursor, limit)
  }

  toParams(): Record<string, string> {
    const params: Record<string, string> = { limit: String(this.limit) }
    if (this.cursor) params.cursor = this.cursor
    return params
  }
}
