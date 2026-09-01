// Helper to unwrap Result from use cases
export function unwrap<T>(result: {
  success: boolean
  value?: T
  data?: T
  error?: unknown
}): T {
  if (!result.success) {
    if (result.error instanceof Error) throw result.error
    throw new Error(typeof result.error === "string" ? result.error : "Operation failed")
  }

  if ("value" in result) return result.value as T
  return result.data as T
}
