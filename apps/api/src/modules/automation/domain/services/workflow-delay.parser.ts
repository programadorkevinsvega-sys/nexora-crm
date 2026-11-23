const DURATION_UNITS_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
}

const MAX_DELAY_MS = 365 * 86_400_000

export function parseWorkflowDelay(value?: string | null): number {
  const input = value?.trim() || '1h'
  const match = /^(0|[1-9]\d*)(s|m|h|d|w)$/.exec(input)
  if (!match) {
    throw new Error(`Invalid workflow delay "${input}". Use a positive integer followed by s, m, h, d, or w.`)
  }

  const amount = Number(match[1])
  const multiplier = DURATION_UNITS_MS[match[2]]
  const delayMs = amount * multiplier

  if (!Number.isSafeInteger(delayMs) || delayMs <= 0 || delayMs > MAX_DELAY_MS) {
    throw new Error('Workflow delay must be greater than zero and no longer than 365 days')
  }

  return delayMs
}

export function calculateWorkflowResumeAt(value?: string | null, now = new Date()): Date {
  return new Date(now.getTime() + parseWorkflowDelay(value))
}
