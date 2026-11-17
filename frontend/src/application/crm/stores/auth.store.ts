import { create } from "zustand"

interface AuthState {
  token: string
  tenantId: string
  userId: string
  isAuthenticated: boolean
  login: (token: string, tenantId: string, userId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: "",
  tenantId: "",
  userId: "",
  isAuthenticated: false,
  login: (token, tenantId, userId) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("crm_token", token)
      sessionStorage.setItem("crm_tenant_id", tenantId)
      sessionStorage.setItem("crm_user_id", userId)
    }
    set({ token, tenantId, userId, isAuthenticated: true })
  },
  logout: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("crm_token")
      sessionStorage.removeItem("crm_tenant_id")
      sessionStorage.removeItem("crm_user_id")
    }
    set({ token: "", tenantId: "", userId: "", isAuthenticated: false })
  },
}))
