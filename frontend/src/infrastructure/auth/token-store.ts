const TOKEN_KEY = "crm_token"
const TENANT_ID_KEY = "crm_tenant_id"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(TOKEN_KEY)
}

export function getTenantId(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(TENANT_ID_KEY)
}

export function setTenantId(id: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(TENANT_ID_KEY, id)
}
