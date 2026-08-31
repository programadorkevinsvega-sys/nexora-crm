export class GetDealWinProbabilityQuery {
  constructor(readonly tenantId: string, readonly dealId: string) {}
}

export class GetContactExecutiveSummaryQuery {
  constructor(readonly tenantId: string, readonly contactId: string) {}
}

export class GetChurnRiskPredictionQuery {
  constructor(readonly tenantId: string, readonly contactId: string) {}
}
