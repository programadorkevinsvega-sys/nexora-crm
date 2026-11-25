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

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function nestedUser(data: UnknownRecord): UnknownRecord {
  return isRecord(data.user) ? data.user : {}
}

function readSessionString(data: UnknownRecord, user: UnknownRecord, key: string, nestedKey = key): string | undefined {
  return readString(data[key]) ?? readString(user[nestedKey])
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    const parsed: unknown = JSON.parse(text)
    return parsed
  } catch {
    return text
  }
}

async function authPost(path: string, body?: unknown): Promise<unknown> {
  const response = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  const data = await parseResponse(response)
  if (!response.ok) {
    const message = isRecord(data) && typeof data.message === "string"
      ? data.message
      : `Request failed with status ${response.status}`
    throw new ApiError(response.status, message, data)
  }
  return data
}

function requireSessionIdentity(tenantId: string | undefined, userId: string | undefined, response: unknown): {
  tenantId: string
  userId: string
} {
  if (!tenantId || !userId) {
    throw new ApiError(401, "The authentication service did not return a tenant and user identity.", response)
  }
  return { tenantId, userId }
}

function parseLoginResponse(response: unknown): {
  data: UnknownRecord
  user: UnknownRecord
  tenantId: string
  userId: string
} {
  if (!isRecord(response)) throw new ApiError(401, "The authentication service returned an invalid response.", response)
  const user = nestedUser(response)
  const tenantId = readSessionString(response, user, "tenantId")
  const userId = readSessionString(response, user, "userId", "id")
  return { data: response, user, ...requireSessionIdentity(tenantId, userId, response) }
}

export const AuthService = {
  async login(email: string, password: string, mfaCode?: string): Promise<LoginResponse> {
    const response = await authPost("/api/auth/login", {
      email,
      password,
      ...(mfaCode ? { mfaCode: mfaCode.trim() } : {}),
    })
    const { data, user, tenantId, userId } = parseLoginResponse(response)

    if (data.mfaRequired === true) {
      sessionStorage.removeItem("crm_token")
      sessionStorage.removeItem("crm_tenant_id")
      sessionStorage.removeItem("crm_user_id")
      sessionStorage.removeItem("crm_user_role")
      sessionStorage.removeItem("crm_user_name")
      sessionStorage.removeItem("crm_user_email")
      sessionStorage.removeItem("crm_company_name")
      return {
        tenantId,
        userId,
        mfaRequired: true,
        mfaType: readString(data.mfaType),
      }
    }

    const token = readString(data.token) ?? readString(data.accessToken)
    if (!token) throw new ApiError(401, "The authentication service did not return an access token.", response)

    const userName = readSessionString(data, user, "userName", "name")
    const userEmail = readSessionString(data, user, "userEmail", "email")
    const companyName = readSessionString(data, user, "companyName")
    const roleFromArray = Array.isArray(user.roles) ? readString(user.roles[0]) : undefined
    const userRole = readSessionString(data, user, "userRole", "role") ?? roleFromArray

    sessionStorage.setItem("crm_token", token)
    sessionStorage.setItem("crm_tenant_id", tenantId)
    sessionStorage.setItem("crm_user_id", userId)
    if (userRole) sessionStorage.setItem("crm_user_role", userRole)
    else sessionStorage.removeItem("crm_user_role")
    if (userName) sessionStorage.setItem("crm_user_name", userName)
    if (userEmail) sessionStorage.setItem("crm_user_email", userEmail)
    if (companyName) sessionStorage.setItem("crm_company_name", companyName)

    return { token, tenantId, userId, userName, userEmail, companyName, userRole }
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST", cache: "no-store" }).catch(() => undefined)
    sessionStorage.removeItem("crm_token")
    sessionStorage.removeItem("crm_tenant_id")
    sessionStorage.removeItem("crm_user_id")
    sessionStorage.removeItem("crm_user_role")
    sessionStorage.removeItem("crm_user_name")
    sessionStorage.removeItem("crm_user_email")
    sessionStorage.removeItem("crm_company_name")
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await authPost("/api/auth/refresh")
    if (!isRecord(response)) throw new ApiError(401, "The token refresh response is invalid.", response)
    const token = readString(response.token) ?? readString(response.accessToken)
    if (!token) throw new ApiError(401, "The authentication service did not return a refreshed token.", response)
    sessionStorage.setItem("crm_token", token)
    return { token }
  },

  async register(name: string, email: string, password: string, company: string): Promise<LoginResponse> {
    const response = await authPost("/api/auth/register", { name, email, password, company })
    const { data, user, tenantId, userId } = parseLoginResponse(response)
    const token = readString(data.token) ?? readString(data.accessToken)
    const userName = readSessionString(data, user, "userName", "name")
    const userEmail = readSessionString(data, user, "userEmail", "email")
    const companyName = readSessionString(data, user, "companyName")
    const userRole = readSessionString(data, user, "userRole", "role")

    if (token) sessionStorage.setItem("crm_token", token)
    sessionStorage.setItem("crm_tenant_id", tenantId)
    sessionStorage.setItem("crm_user_id", userId)
    if (userRole) sessionStorage.setItem("crm_user_role", userRole)
    if (userName) sessionStorage.setItem("crm_user_name", userName)
    if (userEmail) sessionStorage.setItem("crm_user_email", userEmail)
    if (companyName) sessionStorage.setItem("crm_company_name", companyName)
    return { token, tenantId, userId, userName, userEmail, companyName, userRole }
  },
}

export { ApiError }
