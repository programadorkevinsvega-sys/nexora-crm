export interface LatencyPercentiles {
  count: number
  p50: number
  p90: number
  p95: number
  p99: number
  avg: number
  min: number
  max: number
}

export class LatencyTracker {
  private samples: number[] = []
  private readonly maxSamples: number

  constructor(maxSamples: number = 1000) {
    this.maxSamples = maxSamples
  }

  record(durationMs: number): void {
    if (this.samples.length >= this.maxSamples) {
      this.samples.shift()
    }
    this.samples.push(durationMs)
  }

  getPercentiles(): LatencyPercentiles {
    if (this.samples.length === 0) {
      return { count: 0, p50: 0, p90: 0, p95: 0, p99: 0, avg: 0, min: 0, max: 0 }
    }

    const sorted = [...this.samples].sort((a, b) => a - b)
    const count = sorted.length
    const sum = sorted.reduce((acc, val) => acc + val, 0)

    const getPercentileValue = (p: number): number => {
      const index = Math.min(Math.floor((p / 100) * count), count - 1)
      return sorted[index]
    }

    return {
      count,
      p50: getPercentileValue(50),
      p90: getPercentileValue(90),
      p95: getPercentileValue(95),
      p99: getPercentileValue(99),
      avg: parseFloat((sum / count).toFixed(2)),
      min: sorted[0],
      max: sorted[count - 1],
    }
  }

  reset(): void {
    this.samples = []
  }
}
