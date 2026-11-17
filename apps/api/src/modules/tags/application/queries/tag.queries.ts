export class GetTagQuery {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
  ) {}
}

export class ListTagsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly options: {
      search?: string
      cursor?: string
      limit: number
    },
  ) {}
}
