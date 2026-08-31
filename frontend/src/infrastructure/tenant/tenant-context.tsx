"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

interface TenantContextValue {
  tenantId: string | null
  setTenantId: (id: string) => void
}

const TenantContext = createContext<TenantContextValue>({
  tenantId: null,
  setTenantId: () => {},
})

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("crm_tenant_id")
    if (stored) {
      setTenantIdState(stored)
    }
  }, [])

  const setTenantId = useCallback((id: string) => {
    sessionStorage.setItem("crm_tenant_id", id)
    setTenantIdState(id)
  }, [])

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant(): TenantContextValue {
  return useContext(TenantContext)
}
