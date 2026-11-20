"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/src/infrastructure/crm/api/api-client"

type Preview = { tenantId: string; email: string; expiresAt: string; status: string }

export default function AcceptCustomerPortalInvitationPage() {
  const [token, setToken] = useState("")
  const [preview, setPreview] = useState<Preview | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const secret = fragment.get("token") || ""
    const tenantId = new URLSearchParams(window.location.search).get("tenantId") || ""
    window.history.replaceState(null, "", window.location.pathname + window.location.search)
    if (!secret || !tenantId) {
      setError("El enlace de activación está incompleto. Solicita una nueva invitación a tu empresa.")
      setLoading(false)
      return
    }
    setToken(secret)
    api.post<Preview>("/api/customer-portal/invitations/preview", { token: secret })
      .then((data) => setPreview(data))
      .catch((err) => setError(err instanceof Error ? err.message : "La invitación venció o ya fue utilizada."))
      .finally(() => setLoading(false))
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setSaving(true)
    try {
      const result = await api.post<{ tenantId: string; email: string }>(
        "/api/customer-portal/invitations/accept", { token, password },
      )
      window.location.href = "/portal/login?tenantId=" + encodeURIComponent(result.tenantId) +
        "&email=" + encodeURIComponent(result.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar el acceso.")
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-7 shadow-sm space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Nexora CRM</p>
          <h1 className="text-2xl font-bold text-foreground mt-2">Activar portal de clientes</h1>
          <p className="text-sm text-muted-foreground mt-2">Crea una contraseña para acceder de forma segura a tu información.</p>
        </div>
        {loading && <p role="status" className="text-sm text-muted-foreground">Validando invitación...</p>}
        {preview && (
          <>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">Invitación para</p>
              <p className="font-semibold text-foreground">{preview.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Vence: {new Date(preview.expiresAt).toLocaleString()}</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm text-foreground">
                Contraseña
                <input type="password" autoComplete="new-password" minLength={12} maxLength={72}
                  required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
                <span className="mt-1 block text-xs text-muted-foreground">Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.</span>
              </label>
              <label className="block text-sm text-foreground">
                Confirmar contraseña
                <input type="password" autoComplete="new-password" minLength={12} maxLength={72}
                  required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
              </label>
              <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {saving ? "Activando..." : "Activar mi cuenta"}
              </button>
            </form>
          </>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground"><Link href="/portal/login" className="text-primary hover:underline">Ir al inicio de sesión</Link></p>
      </section>
    </main>
  )
}
