export class GetProfileQuery {
  constructor(readonly tenantId: string, readonly contactId: string) {}
}

export class GetSegmentsQuery {
  constructor(readonly tenantId: string) {}
}

export class GetMetricsQuery {
  constructor(readonly tenantId: string, readonly contactId: string) {}
}
