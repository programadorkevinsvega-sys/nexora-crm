import { calculateWorkflowResumeAt, parseWorkflowDelay } from './workflow-delay.parser'

describe('workflow delay parser', () => {
  it.each([
    { value: '10m', expected: 600_000 },
    { value: '24h', expected: 86_400_000 },
    { value: '30d', expected: 2_592_000_000 },
  ])('parses $value', ({ value, expected }) => {
    expect(parseWorkflowDelay(value)).toBe(expected)
  })

  it('defaults an omitted delay to one hour', () => {
    expect(parseWorkflowDelay()).toBe(3_600_000)
  })

  it.each(['0m', '-1h', '1.5h', '1month', '366d', ''])('rejects invalid delay %s', (value) => {
    expect(() => parseWorkflowDelay(value)).toThrow()
  })

  it('calculates a deterministic resume timestamp', () => {
    const now = new Date('2026-11-23T12:00:00.000Z')
    expect(calculateWorkflowResumeAt('10m', now).toISOString()).toBe('2026-11-23T12:10:00.000Z')
  })
})
