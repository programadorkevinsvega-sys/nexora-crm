"use client"

import React, { useState } from "react"
import { Database, X, Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"

interface HubSpotConfigModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function HubSpotConfigModal({ open, onClose, onSuccess }: HubSpotConfigModalProps) {
  const [accessToken, setAccessToken] = useState("")
  const [syncContacts, setSyncContacts] = useState(true)
  const [syncCompanies, setSyncCompanies] = useState(true)
  const [syncDeals, setSyncDeals] = useState(true)
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await ApiIntegrationsRepository.saveConfig({
        provider: "HUBSPOT_SYNC",
        credentials: {
          accessToken: accessToken.trim(),
          syncContacts,
          syncCompanies,
          syncDeals,
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
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">HubSpot CRM Sync & Migración</h3>
              <p className="text-xs text-zinc-400">Importación y sincronización de Empresas, Contactos y Negocios</p>
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
            <label className="block font-medium text-zinc-300 mb-1">HubSpot Private App Access Token *</label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                required
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="pat-na1-..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 pr-10 font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncContacts}
                onChange={(e) => setSyncContacts(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500"
              />
              <span className="text-zinc-200">Sincronizar Contactos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncCompanies}
                onChange={(e) => setSyncCompanies(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500"
              />
              <span className="text-zinc-200">Sincronizar Empresas & Cuentas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncDeals}
                onChange={(e) => setSyncDeals(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500"
              />
              <span className="text-zinc-200">Sincronizar Oportunidades (Deals)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2 bg-orange-600 hover:bg-orange-500 text-white">
              <Check className="h-3.5 w-3.5" />
              {saving ? "Conectando..." : "Guardar & Autorizar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
