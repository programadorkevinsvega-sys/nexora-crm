const DURATION_UNITS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
}

export function parseWorkflowDelay(value: string): number {
  const normalized = value.trim().toLowerCase()
  const match = /^([1-9]\d*)(ms|s|m|h|d)$/.exec(normalized)

  if (!match) {
    throw new Error(
      `Invalid workflow delay "${value}". Use a positive integer followed by ms, s, m, h, or d.`,
    )
  }

  const amount = Number(match[1])
  const multiplier = DURATION_UNITS[match[2]]
  const delayMs = amount * multiplier

  if (!Number.isSafeInteger(delayMs) || delayMs < 1) {
    throw new Error(`Workflow delay "${value}" exceeds the supported safe range`)
  }

  return delayMs
}
