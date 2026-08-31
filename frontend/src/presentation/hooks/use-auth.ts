"use client"
import { useSession } from "@src/infrastructure/auth/auth-provider"

export function useAuth() {
  const { session, setSession, clear } = useSession()
  return {
    token: session?.token ?? null,
    tenantId: session?.tenantId ?? null,
    userId: session?.userId ?? null,
    userRole: session?.userRole ?? "admin",
    userName: session?.userName ?? "Usuario",
    isAuthenticated: !!session,
    login: setSession,
    logout: clear,
  }
}
