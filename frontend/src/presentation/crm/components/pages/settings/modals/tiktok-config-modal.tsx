"use client"

import React, { useState, useEffect } from "react"
import { Copy, Check, X, ExternalLink, Sparkles, Smartphone } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"

interface TiktokConfigModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TiktokConfigModal({ open, onClose, onSuccess }: TiktokConfigModalProps) {
  const [advertiserId, setAdvertiserId] = useState("")
  const [pixelId, setPixelId] = useState("")
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [webhookUrl, setWebhookUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/integrations/tiktok/webhook`)
    }
  }, [])

  if (!open) return null

  const handleCopy = () => {
    if (navigator?.clipboard && webhookUrl) {
      navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await ApiIntegrationsRepository.saveConfig({
        provider: "TIKTOK_LEADS",
        credentials: {
          advertiserId: advertiserId.trim(),
          pixelId: pixelId.trim(),
          webhookUrl,
        },
        isEnabled: true,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message || "Error al guardar configuración de TikTok")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">TikTok Lead Generation & Ads</h3>
              <p className="text-xs text-zinc-400">Captura leads instantáneos desde campañas de TikTok Ads</p>
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
          {/* Webhook Endpoint */}
          <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-200">URL del Webhook de Nexora CRM para TikTok:</label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "¡Copiado!" : "Copiar URL"}
              </button>
            </div>
            <div className="p-2 rounded-lg bg-black/60 border border-zinc-800 font-mono text-[11px] text-cyan-300 select-all truncate">
              {webhookUrl || "Cargando URL del Webhook..."}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">TikTok Advertiser ID (Opcional)</label>
              <input
                type="text"
                value={advertiserId}
                onChange={(e) => setAdvertiserId(e.target.value)}
                placeholder="e.g. 71928374619283"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-zinc-100 focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">TikTok Pixel ID (Opcional)</label>
              <input
                type="text"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="e.g. C0123456789"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-zinc-100 focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-[11px] text-zinc-400">
            <div className="font-semibold text-zinc-200 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Pasos en TikTok Ads Manager:
            </div>
            <p>1. Ve a TikTok Ads Manager → <strong>Herramientas</strong> → <strong>Generación de Clientes Potenciales</strong>.</p>
            <p>2. En tu formulario Instant Form, haz clic en <strong>Webhooks</strong> y pega la URL del CRM.</p>
            <p>3. Cada prospecto que complete tu anuncio en TikTok se creará en vivo en Nexora CRM con etiqueta <span className="font-mono text-pink-400">tiktok-lead</span>.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold">
              <Check className="h-3.5 w-3.5" />
              {saving ? "Guardando..." : "Activar Conector TikTok"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
