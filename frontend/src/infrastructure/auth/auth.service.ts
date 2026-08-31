import { ApiError } from "../crm/api/api-client"

export interface LoginResponse {
  token: string
  tenantId: string
  userId: string
  userName?: string
  userEmail?: string
  companyName?: string
}

async function parse(res: Response) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function authPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  const data = await parse(res)
  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed with status ${res.status}`
    throw new ApiError(res.status, message, data)
  }

  return data as T
}

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await authPost<LoginResponse>("/api/auth/login", { email, password })
    sessionStorage.setItem("crm_token", data.token)
    sessionStorage.setItem("crm_tenant_id", data.tenantId)
    sessionStorage.setItem("crm_user_id", data.userId)
    if (data.userName) sessionStorage.setItem("crm_user_name", data.userName)
    if (data.userEmail) sessionStorage.setItem("crm_user_email", data.userEmail)
    if (data.companyName) sessionStorage.setItem("crm_company_name", data.companyName)
    return data
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    }).catch(() => undefined)

    sessionStorage.removeItem("crm_token")
    sessionStorage.removeItem("crm_tenant_id")
    sessionStorage.removeItem("crm_user_id")
    sessionStorage.removeItem("crm_user_name")
    sessionStorage.removeItem("crm_user_email")
    sessionStorage.removeItem("crm_company_name")
  },

  async refreshToken(): Promise<{ token: string }> {
    const data = await authPost<{ token: string }>("/api/auth/refresh")
    sessionStorage.setItem("crm_token", data.token)
    return data
  },

  async register(name: string, email: string, password: string, company: string): Promise<any> {
    return authPost<any>("/api/auth/register", { name, email, password, company })
  },
}

export { ApiError }
