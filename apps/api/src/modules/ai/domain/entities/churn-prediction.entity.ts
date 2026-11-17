export type ChurnRiskTier = 'LOW' | 'MEDIUM' | 'HIGH'

export class ChurnRiskPrediction {
  constructor(
    readonly contactId: string,
    readonly contactName: string,
    readonly churnRiskPercent: number,
    readonly churnRiskLevel: ChurnRiskTier,
    readonly riskIndicators: string[],
    readonly preventiveActions: string[],
    readonly calculatedAt: Date,
  ) {}
}
