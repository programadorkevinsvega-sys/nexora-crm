import { retryWithBackoff, CircuitBreaker, CircuitState, LatencyTracker } from '@crm/shared'

describe('Resilience & Observability Utilities', () => {
  describe('retryWithBackoff', () => {
    it('should succeed on first try if no error', async () => {
      const fn = jest.fn().mockResolvedValue('ok')
      const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelayMs: 10 })
      expect(result).toBe('ok')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and succeed if subsequent call succeeds', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('transient error'))
        .mockResolvedValue('recovered')

      const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelayMs: 10 })
      expect(result).toBe('recovered')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should throw after exceeding maxRetries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fatal error'))
      await expect(retryWithBackoff(fn, { maxRetries: 2, initialDelayMs: 10 })).rejects.toThrow('fatal error')
      expect(fn).toHaveBeenCalledTimes(3)
    })
  })

  describe('CircuitBreaker', () => {
    it('should remain CLOSED on successful executions', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 3 })
      await cb.execute(async () => 'success')
      expect(cb.getState()).toBe(CircuitState.CLOSED)
    })

    it('should trip to OPEN when failure threshold is reached', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 1000 })

      try { await cb.execute(async () => { throw new Error('fail 1') }) } catch {}
      try { await cb.execute(async () => { throw new Error('fail 2') }) } catch {}

      expect(cb.getState()).toBe(CircuitState.OPEN)
      await expect(cb.execute(async () => 'blocked')).rejects.toThrow(/CircuitBreaker is OPEN/)
    })
  })

  describe('LatencyTracker (p50, p90, p95, p99)', () => {
    it('should calculate accurate latency percentiles', () => {
      const tracker = new LatencyTracker()
      for (let i = 1; i <= 100; i++) {
        tracker.record(i)
      }

      const p = tracker.getPercentiles()
      expect(p.count).toBe(100)
      expect(p.p50).toBe(51)
      expect(p.p90).toBe(91)
      expect(p.p95).toBe(96)
      expect(p.p99).toBe(100)
      expect(p.min).toBe(1)
      expect(p.max).toBe(100)
      expect(p.avg).toBe(50.5)
    })
  })
})
