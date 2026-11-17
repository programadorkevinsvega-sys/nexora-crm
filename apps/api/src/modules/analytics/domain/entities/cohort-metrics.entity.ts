import { CohortRow } from '@crm/contracts'

export class CohortMetrics {
  constructor(readonly cohorts: CohortRow[]) {}
}
