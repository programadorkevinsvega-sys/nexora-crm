import { DealFilter } from '../../domain/repositories/deal.repository'

export class GetPipelineQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListPipelinesQuery {
  constructor(readonly tenantId: string) {}
}

export class GetPipelineBoardQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListDealsQuery {
  constructor(readonly tenantId: string, readonly filter: DealFilter) {}
}

export class GetDealQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}
