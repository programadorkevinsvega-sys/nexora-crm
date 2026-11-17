import { create } from "zustand"

interface TenantState {
  tenantId: string
  setTenantId: (id: string) => void
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: typeof window !== "undefined" ? sessionStorage.getItem("crm_tenant_id") ?? "" : "",
  setTenantId: (id) => {
    if (typeof window !== "undefined") sessionStorage.setItem("crm_tenant_id", id)
    set({ tenantId: id })
  },
}))
