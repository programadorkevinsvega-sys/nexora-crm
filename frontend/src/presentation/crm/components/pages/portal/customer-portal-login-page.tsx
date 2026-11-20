"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/src/infrastructure/crm/api/api-client"

type PortalSession = {
  accessToken: string
  refreshToken: string
  accountId: string
  tenantId: string
  contactId: string
  email: string
}

export default function CustomerPortalLoginPage() {
  const [tenantId, setTenantId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setTenantId(params.get("tenantId") || "")
    setEmail(params.get("email") || "")
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      const result = await api.post<PortalSession>("/api/customer-portal/auth/login", {
        tenantId, email, password,
      })
      sessionStorage.setItem("portal_access_token", result.accessToken)
      sessionStorage.setItem("portal_refresh_token", result.refreshToken)
      sessionStorage.setItem("portal_tenant_id", result.tenantId)
      sessionStorage.setItem("portal_account_id", result.accountId)
      window.location.href = "/portal"
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.")
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-7 shadow-sm space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Nexora CRM</p>
          <h1 className="text-2xl font-bold text-foreground mt-2">Portal de clientes</h1>
          <p className="text-sm text-muted-foreground mt-2">Accede a tus cotizaciones y solicitudes de soporte.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm text-foreground">
            Código de empresa
            <input required type="text" inputMode="text" value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
          </label>
          <label className="block text-sm text-foreground">
            Correo electrónico
            <input required type="email" autoComplete="username" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
          </label>
          <label className="block text-sm text-foreground">
            Contraseña
            <input required type="password" autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={saving || !tenantId || !email || !password}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground">
          ¿Aún no tienes acceso? Solicita a tu empresa una invitación verificada.
        </p>
        <Link href="/login" className="text-xs text-primary hover:underline">Acceso de colaboradores</Link>
      </section>
    </main>
  )
}
