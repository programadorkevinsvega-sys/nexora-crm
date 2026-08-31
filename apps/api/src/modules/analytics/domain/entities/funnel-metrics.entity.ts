import { FunnelStage } from '@crm/contracts'

export class FunnelMetrics {
  constructor(
    readonly period: string,
    readonly stages: FunnelStage[],
    readonly overallConversionRatePercent: number,
  ) {}
}
