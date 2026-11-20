export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? "/api" : (process.env.INTERNAL_BFF_URL || "http://127.0.0.1:3006/api"))

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message)
  }
}

type HeadersInit = Record<string, string>

function isPortalPath(path: string): boolean {
  return path.startsWith("/api/customer-portal")
}

function resolveRequestUrl(path: string): string {
  if (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://")) {
    if (API_BASE_URL.endsWith("/api") && path.startsWith("/api")) return API_BASE_URL.slice(0, -4) + path
    return API_BASE_URL + path
  }
  if (API_BASE_URL === "/api" && path.startsWith("/api")) return path
  return API_BASE_URL + path
}

function buildHeaders(extra?: HeadersInit, path = ""): HeadersInit {
  const headers: HeadersInit = { ...extra }
  let tenantId = "00000000-0000-0000-0000-000000000001"
  if (typeof window !== "undefined" && isPortalPath(path)) {
    const token = sessionStorage.getItem("portal_access_token")
    const storedTenantId = sessionStorage.getItem("portal_tenant_id")
    if (token && token !== "undefined" && token !== "null") headers["Authorization"] = "Bearer " + token
    if (storedTenantId && storedTenantId !== "undefined" && storedTenantId !== "null") headers["X-Tenant-Id"] = storedTenantId
    return headers
  }
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("crm_token")
    const storedTenantId = sessionStorage.getItem("crm_tenant_id")
    const userId = sessionStorage.getItem("crm_user_id")
    if (token && token !== "undefined" && token !== "null" && token.length > 20) headers["Authorization"] = "Bearer " + token
    if (storedTenantId && storedTenantId !== "undefined" && storedTenantId !== "null") tenantId = storedTenantId
    if (userId && userId !== "undefined" && userId !== "null") headers["X-User-Id"] = userId
  }
  headers["X-Tenant-Id"] = headers["X-Tenant-Id"] || tenantId
  return headers
}
async function parse(res: Response) {
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) }
  catch { return text }
}

async function request<T>(method: string, path: string, body?: unknown, portalRetry = false): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : "/" + path
  const headers = buildHeaders(body ? { "Content-Type": "application/json" } : undefined, normalizedPath)
  const url = resolveRequestUrl(normalizedPath)
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: "no-store" })
  const data = await parse(res)
  if (!res.ok) {
    const portalRequest = isPortalPath(normalizedPath)
    const publicPortalPaths = [
      "/api/customer-portal/auth/login",
      "/api/customer-portal/auth/refresh",
      "/api/customer-portal/invitations/preview",
      "/api/customer-portal/invitations/accept",
    ]
    if (res.status === 401 && portalRequest && typeof window !== "undefined" && !portalRetry && !publicPortalPaths.includes(normalizedPath)) {
      const refreshToken = sessionStorage.getItem("portal_refresh_token")
      const tenantId = sessionStorage.getItem("portal_tenant_id")
      if (refreshToken && tenantId) {
        try {
          const refreshResponse = await fetch(resolveRequestUrl("/api/customer-portal/auth/refresh"), {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantId, refreshToken }), cache: "no-store",
          })
          const refreshed = await parse(refreshResponse)
          if (refreshResponse.ok && refreshed?.accessToken && refreshed?.refreshToken) {
            sessionStorage.setItem("portal_access_token", refreshed.accessToken)
            sessionStorage.setItem("portal_refresh_token", refreshed.refreshToken)
            sessionStorage.setItem("portal_account_id", refreshed.accountId || "")
            return request<T>(method, normalizedPath, body, true)
          }
        } catch {
          // The session is cleared below if refresh cannot be completed.
        }
      }
    }
    if (res.status === 401 && portalRequest && typeof window !== "undefined") {
      sessionStorage.removeItem("portal_access_token")
      sessionStorage.removeItem("portal_refresh_token")
      sessionStorage.removeItem("portal_tenant_id")
      sessionStorage.removeItem("portal_account_id")
      if (!window.location.pathname.startsWith("/portal/login") && !window.location.pathname.startsWith("/portal/accept-invitation")) {
        window.location.href = "/portal/login?redirect=" + encodeURIComponent(window.location.pathname)
      }
    }
    if (res.status === 401 && !portalRequest && typeof window !== "undefined") {
      sessionStorage.removeItem("crm_token")
      sessionStorage.removeItem("crm_tenant_id")
      sessionStorage.removeItem("crm_user_id")
      sessionStorage.removeItem("crm_user_role")
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register" &&
          !window.location.pathname.startsWith("/f/") && !window.location.pathname.startsWith("/embed/")) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname)
      }
    }
    const message = (data && typeof data === "object" && "message" in data && String((data as { message: unknown }).message)) || "Request failed with status " + res.status
    throw new ApiError(res.status, message, data)
  }
  return data as T
}
export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
}

export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "" || value === "undefined" || value === "null") continue
    search.set(key, String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ""
}
