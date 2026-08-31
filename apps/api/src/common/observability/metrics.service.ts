import { Injectable } from '@nestjs/common'
import { LatencyTracker, LatencyPercentiles } from '@crm/shared'

@Injectable()
export class MetricsService {
  private trackers = new Map<string, LatencyTracker>()

  recordLatency(operation: string, durationMs: number): void {
    if (!this.trackers.has(operation)) {
      this.trackers.set(operation, new LatencyTracker(1000))
    }
    this.trackers.get(operation)!.record(durationMs)
  }

  getMetricsFor(operation: string): LatencyPercentiles | null {
    const tracker = this.trackers.get(operation)
    if (!tracker) return null
    return tracker.getPercentiles()
  }

  getAllMetrics(): Record<string, LatencyPercentiles> {
    const result: Record<string, LatencyPercentiles> = {}
    for (const [op, tracker] of this.trackers.entries()) {
      result[op] = tracker.getPercentiles()
    }
    return result
  }
}
