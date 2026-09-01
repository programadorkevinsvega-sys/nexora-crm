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

function buildHeaders(extra?: HeadersInit): HeadersInit {
  const headers: HeadersInit = { ...extra }
  let tenantId = "00000000-0000-0000-0000-000000000001"
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("crm_token")
    const storedTenantId = sessionStorage.getItem("crm_tenant_id")
    const userId = sessionStorage.getItem("crm_user_id")
    if (token) headers["Authorization"] = `Bearer ${token}`
    if (storedTenantId && storedTenantId !== "undefined" && storedTenantId !== "null") tenantId = storedTenantId
    if (userId) headers["X-User-Id"] = userId
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

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers = buildHeaders(body ? { "Content-Type": "application/json" } : undefined)
  
  let normalizedPath = path.startsWith("/") ? path : `/${path}`
  let url: string

  if (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://")) {
    if (API_BASE_URL.endsWith("/api") && normalizedPath.startsWith("/api")) {
      url = `${API_BASE_URL.slice(0, -4)}${normalizedPath}`
    } else {
      url = `${API_BASE_URL}${normalizedPath}`
    }
  } else {
    // Relative URL (client-side in browser e.g. "/api")
    if (API_BASE_URL === "/api" && normalizedPath.startsWith("/api")) {
      url = normalizedPath
    } else {
      url = `${API_BASE_URL}${normalizedPath}`
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })
  const data = await parse(res)
  if (!res.ok) {
    const message = (data && typeof data === "object" && "message" in data && String((data as { message: unknown }).message)) || `Request failed with status ${res.status}`
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
