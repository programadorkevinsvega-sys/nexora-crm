export class GetLeadScoreQuery {
  constructor(readonly tenantId: string, readonly contactId: string) {}
}

export class ListScoringRulesQuery {
  constructor(readonly tenantId: string, readonly activeOnly = false) {}
}

export class ListTopLeadsQuery {
  constructor(readonly tenantId: string, readonly limit = 20) {}
}

export class ListLeadsByTemperatureQuery {
  constructor(readonly tenantId: string, readonly temperature: string) {}
}
