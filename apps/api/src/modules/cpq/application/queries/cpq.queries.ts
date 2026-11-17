export class GetProductQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListProductsQuery {
  constructor(readonly tenantId: string, readonly activeOnly = false) {}
}

export class GetQuoteApprovalQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListPendingApprovalsQuery {
  constructor(readonly tenantId: string) {}
}

export class GetSignatureByTokenQuery {
  constructor(readonly token: string) {}
}
