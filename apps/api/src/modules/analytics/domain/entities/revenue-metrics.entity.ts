export class RevenueMetrics {
  constructor(
    readonly totalArr: number,
    readonly totalMrr: number,
    readonly newMrr: number,
    readonly expansionMrr: number,
    readonly contractionMrr: number,
    readonly churnedMrr: number,
    readonly netNewMrr: number,
    readonly ltv: number,
    readonly cac: number,
    readonly ltvCacRatio: number,
    readonly winRatePercent: number,
    readonly avgDealSize: number,
    readonly avgSalesCycleDays: number,
    readonly salesVelocityPerDay: number,
    readonly currency: string,
  ) {}
}
