/**
 * Creates an isolated, deeply frozen snapshot of JSON-compatible domain data.
 * Workflow definitions and execution payloads must not share mutable references
 * with callers or with subsequently created versions.
 */
export function cloneAndFreezeJson<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneAndFreezeJson(item))) as T
  }

  const snapshot: Record<string, unknown> = {}
  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    snapshot[key] = cloneAndFreezeJson(nestedValue)
  }

  return Object.freeze(snapshot) as T
}
