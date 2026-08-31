"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

export interface Session {
  token: string
  tenantId: string
  userId: string
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
    const userName = sessionStorage.getItem("crm_user_name") ?? undefined
    const userEmail = sessionStorage.getItem("crm_user_email") ?? undefined
    const companyName = sessionStorage.getItem("crm_company_name") ?? undefined
    if (token && tenantId && userId) {
      setSessionState({ token, tenantId, userId, userName, userEmail, companyName })
    }
    setReady(true)
  }, [])

  const setSession = useCallback((s: Session) => {
    sessionStorage.setItem("crm_token", s.token)
    sessionStorage.setItem("crm_tenant_id", s.tenantId)
    sessionStorage.setItem("crm_user_id", s.userId)
    if (s.userName) sessionStorage.setItem("crm_user_name", s.userName)
    if (s.userEmail) sessionStorage.setItem("crm_user_email", s.userEmail)
    if (s.companyName) sessionStorage.setItem("crm_company_name", s.companyName)
    setSessionState(s)
  }, [])

  const clear = useCallback(() => {
    sessionStorage.removeItem("crm_token")
    sessionStorage.removeItem("crm_tenant_id")
    sessionStorage.removeItem("crm_user_id")
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
