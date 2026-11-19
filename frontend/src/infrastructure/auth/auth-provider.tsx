"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

export interface Session {
  token: string
  tenantId: string
  userId: string
  userRole?: string
  userName?: string
  userEmail?: string
  companyName?: string
}

interface SessionContextValue {
  ready: boolean
  session: Session | null
  setSession: (session: Session) => void
  clear: () => void
}

const SessionContext = createContext<SessionContextValue>({
  ready: false,
  session: null,
  setSession: () => {},
  clear: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSessionState] = useState<Session | null>(null)

  useEffect(() => {
    const token = sessionStorage.getItem("crm_token")
    const tenantId = sessionStorage.getItem("crm_tenant_id")
    const userId = sessionStorage.getItem("crm_user_id")
    const userRole = sessionStorage.getItem("crm_user_role") ?? undefined
    const userName = sessionStorage.getItem("crm_user_name") ?? undefined
    const userEmail = sessionStorage.getItem("crm_user_email") ?? undefined
    const companyName = sessionStorage.getItem("crm_company_name") ?? undefined

    const isValidToken =
      Boolean(token) &&
      token !== "undefined" &&
      token !== "null" &&
      typeof token === "string" &&
      token.split(".").length === 3

    if (isValidToken && tenantId && userId && tenantId !== "undefined" && userId !== "undefined") {
      setSessionState({ token: token!, tenantId, userId, userRole, userName, userEmail, companyName })
    } else {
      setSessionState(null)
      if (typeof window !== "undefined") {
        const path = window.location.pathname
        if (
          path !== "/login" &&
          path !== "/register" &&
          !path.startsWith("/f/") &&
          !path.startsWith("/embed/")
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`
        }
      }
    }
    setReady(true)
  }, [])

  const setSession = useCallback((s: Session) => {
    sessionStorage.setItem("crm_token", s.token)
    sessionStorage.setItem("crm_tenant_id", s.tenantId)
    sessionStorage.setItem("crm_user_id", s.userId)
    if (s.userRole) sessionStorage.setItem("crm_user_role", s.userRole)
    else sessionStorage.removeItem("crm_user_role")
    if (s.userName) sessionStorage.setItem("crm_user_name", s.userName)
    if (s.userEmail) sessionStorage.setItem("crm_user_email", s.userEmail)
    if (s.companyName) sessionStorage.setItem("crm_company_name", s.companyName)
    setSessionState(s)
  }, [])

  const clear = useCallback(() => {
    sessionStorage.removeItem("crm_token")
    sessionStorage.removeItem("crm_tenant_id")
    sessionStorage.removeItem("crm_user_id")
    sessionStorage.removeItem("crm_user_role")
    sessionStorage.removeItem("crm_user_name")
    sessionStorage.removeItem("crm_user_email")
    sessionStorage.removeItem("crm_company_name")
    setSessionState(null)
  }, [])

  return (
    <SessionContext.Provider value={{ ready, session, setSession, clear }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext)
}
