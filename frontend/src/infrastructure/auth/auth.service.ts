import { ApiError } from "../crm/api/api-client"

export interface LoginResponse {
  token?: string
  tenantId: string
  userId: string
  userName?: string
  userEmail?: string
  companyName?: string
  userRole?: string
  mfaRequired?: boolean
  mfaType?: string
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
  async login(email: string, password: string, mfaCode?: string): Promise<LoginResponse> {
    const data = await authPost<any>("/api/auth/login", {
      email,
      password,
      ...(mfaCode ? { mfaCode: mfaCode.trim() } : {}),
    })

    const tenantId = data.tenantId || data.user?.tenantId || "00000000-0000-0000-0000-000000000001"
    const userId = data.userId || data.user?.id || ""

    if (data.mfaRequired === true) {
      // A challenge must never leave a previous/stale authenticated session available.
      sessionStorage.removeItem("crm_token")
      sessionStorage.removeItem("crm_tenant_id")
      sessionStorage.removeItem("crm_user_id")
      sessionStorage.removeItem("crm_user_role")
      sessionStorage.removeItem("crm_user_name")
      sessionStorage.removeItem("crm_user_email")
      sessionStorage.removeItem("crm_company_name")
      return { tenantId, userId, mfaRequired: true, mfaType: data.mfaType }
    }

    const token = data.token || data.accessToken || ""
    if (!token || !userId || !tenantId) {
      throw new ApiError(401, "The authentication service did not return a complete session.", data)
    }

    const userName = data.userName || data.user?.name || ""
    const userEmail = data.userEmail || data.user?.email || ""
    const companyName = data.companyName || data.user?.companyName || ""
    const userRole = data.userRole || data.user?.role || data.user?.roles?.[0]

    sessionStorage.setItem("crm_token", token)
    sessionStorage.setItem("crm_tenant_id", tenantId)
    sessionStorage.setItem("crm_user_id", userId)
    if (userRole) sessionStorage.setItem("crm_user_role", userRole)
    else sessionStorage.removeItem("crm_user_role")
    if (userName) sessionStorage.setItem("crm_user_name", userName)
    if (userEmail) sessionStorage.setItem("crm_user_email", userEmail)
    if (companyName) sessionStorage.setItem("crm_company_name", companyName)

    return { token, tenantId, userId, userName, userEmail, companyName, userRole }
  }

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    }).catch(() => undefined)

    sessionStorage.removeItem("crm_token")
    sessionStorage.removeItem("crm_tenant_id")
    sessionStorage.removeItem("crm_user_id")
    sessionStorage.removeItem("crm_user_role")
    sessionStorage.removeItem("crm_user_name")
    sessionStorage.removeItem("crm_user_email")
    sessionStorage.removeItem("crm_company_name")
  },

  async refreshToken(): Promise<{ token: string }> {
    const data = await authPost<any>("/api/auth/refresh")
    const token = data.token || data.accessToken || ""
    if (token) sessionStorage.setItem("crm_token", token)
    return { token }
  },

  async register(name: string, email: string, password: string, company: string): Promise<LoginResponse> {
    const data = await authPost<any>("/api/auth/register", { name, email, password, company })
    const token = data.token || data.accessToken || ""
    const tenantId = data.tenantId || data.user?.tenantId || "00000000-0000-0000-0000-000000000001"
    const userId = data.userId || data.user?.id || ""
    const userName = data.userName || data.user?.name || ""
    const userEmail = data.userEmail || data.user?.email || ""
    const companyName = data.companyName || data.user?.companyName || ""

    if (token) sessionStorage.setItem("crm_token", token)
    if (tenantId) sessionStorage.setItem("crm_tenant_id", tenantId)
    if (userId) sessionStorage.setItem("crm_user_id", userId)
    if (userName) sessionStorage.setItem("crm_user_name", userName)
    if (userEmail) sessionStorage.setItem("crm_user_email", userEmail)
    if (companyName) sessionStorage.setItem("crm_company_name", companyName)
    return { token, tenantId, userId, userName, userEmail, companyName }
  },
}

export { ApiError }
