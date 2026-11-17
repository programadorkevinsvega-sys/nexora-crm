"use client"

import React, { useState } from "react"
import { Zap, X, Check } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"

interface ZapierConfigModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ZapierConfigModal({ open, onClose, onSuccess }: ZapierConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await ApiIntegrationsRepository.saveConfig({
        provider: "ZAPIER_MAKE",
        credentials: {
          webhookUrl: webhookUrl.trim(),
          apiKey: apiKey.trim(),
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
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Zapier, Make.com & n8n</h3>
              <p className="text-xs text-zinc-400">Conecta Nexora CRM con más de 5,000 aplicaciones no-code</p>
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
            <label className="block font-medium text-zinc-300 mb-1">Webhook Target URL (Catch Hook) *</label>
            <input
              type="url"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Header Secret / API Key de Verificación</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="zap_secret_..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="font-semibold text-zinc-200 block">Eventos que dispararán este Webhook:</span>
            <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5">
              <li>Nuevo Contacto creado en Nexora CRM</li>
              <li>Oportunidad Comercial cerrada / ganada (Deal Won)</li>
              <li>Nuevo Ticket de soporte generado</li>
              <li>Envío de formulario Web completado</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2 bg-amber-600 hover:bg-amber-500 text-white">
              <Check className="h-3.5 w-3.5" />
              {saving ? "Guardando..." : "Guardar Webhook"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
