"use client"

import React, { useState } from "react"
import { Calendar, X, Check, Eye, EyeOff, Mail, Video } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"

interface GoogleConfigModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function GoogleConfigModal({ open, onClose, onSuccess }: GoogleConfigModalProps) {
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [syncCalendar, setSyncCalendar] = useState(true)
  const [syncGmail, setSyncGmail] = useState(true)
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await ApiIntegrationsRepository.saveConfig({
        provider: "GOOGLE_WORKSPACE",
        credentials: {
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          syncCalendar,
          syncGmail,
        },
        isEnabled: true,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message || "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Google Workspace & Calendar</h3>
              <p className="text-xs text-zinc-400">Sincronización bidireccional de reuniones, Google Meet y Gmail</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Google OAuth Client ID *</label>
            <input
              type="text"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="123456789-abc.apps.googleusercontent.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Google Client Secret *</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                required
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="GOCSPX-..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 pr-10 font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncCalendar}
                onChange={(e) => setSyncCalendar(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500"
              />
              <span className="text-zinc-200 flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-amber-400" />
                Sincronizar Google Calendar y generar enlaces de Google Meet para citas
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncGmail}
                onChange={(e) => setSyncGmail(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500"
              />
              <span className="text-zinc-200 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-red-400" />
                Sincronizar hilos de Gmail con la ficha 360 del Contacto
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2 bg-amber-600 hover:bg-amber-500 text-white">
              <Check className="h-3.5 w-3.5" />
              {saving ? "Conectando..." : "Guardar & Conectar Google"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
