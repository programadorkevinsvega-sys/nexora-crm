export type IntegrationCredentials = Record<string, unknown>
export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}
}
export function credentialString(credentials: IntegrationCredentials, key: string): string | undefined {
  const value = credentials[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
export function credentialNumber(credentials: IntegrationCredentials, key: string): number | undefined {
  const value = credentials[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  const message = asRecord(error).message
  return typeof message === 'string' ? message : String(error)
}
export function errorName(error: unknown): string | undefined {
  const name = asRecord(error).name
  return typeof name === 'string' ? name : undefined
}