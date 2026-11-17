export type DealHealthStatus = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL'

export class DealWinPrediction {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly dealId: string,
    readonly dealName: string,
    readonly dealAmount: number,
    readonly winProbabilityPercent: number,
    readonly dealHealth: DealHealthStatus,
    readonly positiveFactors: string[],
    readonly riskFactors: string[],
    readonly recommendedNextActions: string[],
    readonly predictedCloseDate: string,
    readonly calculatedAt: Date,
  ) {}
}
