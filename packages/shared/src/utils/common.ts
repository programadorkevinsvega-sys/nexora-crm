export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || value === undefined) return false
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) result[key] = obj[key]
  }
  return result
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) delete result[key]
  return result as Omit<T, K>
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target } as Record<string, unknown>
  for (const key of Object.keys(source)) {
    const val = source[key as keyof typeof source]
    const targetVal = target[key as keyof T]
    if (isPlainObject(val) && isPlainObject(targetVal)) {
      result[key] = deepMerge(targetVal as Record<string, unknown>, val as Record<string, unknown>)
    } else if (val !== undefined) {
      result[key] = val
    }
  }
  return result as T
}
