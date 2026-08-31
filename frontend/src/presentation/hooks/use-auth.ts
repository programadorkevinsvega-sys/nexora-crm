"use client"
import { useSession } from "@src/infrastructure/auth/auth-provider"

export function useAuth() {
  const { session, setSession, clear } = useSession()
  return {
    token: session?.token ?? null,
    tenantId: session?.tenantId ?? null,
    userId: session?.userId ?? null,
    isAuthenticated: !!session,
    login: setSession,
    logout: clear,
  }
}
