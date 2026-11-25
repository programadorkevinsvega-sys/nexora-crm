"use client"

import React, { useState } from "react"
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"

interface DiscordConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DiscordConfigModal({ isOpen, onClose, onSuccess }: DiscordConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [botName, setBotName] = useState("Nexora Sales Bot")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = async () => {
    if (!webhookUrl.trim()) {
      alert("Por favor ingresa la URL de Webhook de Discord")
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await ApiIntegrationsRepository.testIntegration(
        "DISCORD",
        webhookUrl.trim(),
        "🚀 Prueba de alerta en vivo desde Nexora CRM hacia Discord"
      )
      setTestResult(res)
    } catch (err: unknown) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "Error al conectar con Discord" })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!webhookUrl.trim()) return
    setSaving(true)
    try {
      await ApiIntegrationsRepository.saveConfig({
        provider: "DISCORD",
        isEnabled: true,
        credentials: {
          webhookUrl: webhookUrl.trim(),
          botName: botName.trim(),
          avatarUrl: avatarUrl.trim() || undefined,
        },
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      alert(`Error al guardar: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎮 Integración Nativa con Discord">
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <p className="text-muted-foreground text-[11px]">
          Envía notificaciones automáticas con diseño Embed enriquecido (Deals Ganados, Leads Calificados y Tickets Críticos) directamente a tus canales de Discord.
        </p>

        <div>
          <label className="block font-medium mb-1">Webhook URL de Discord *</label>
          <input
            type="url"
            required
            placeholder="https://discord.com/api/webhooks/123456789/abcdef..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background text-xs font-mono"
          />
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Obtenla en: Servidor de Discord ➔ Ajustes del Canal ➔ Integraciones ➔ Webhooks.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">Nombre del Bot</label>
            <input
              type="text"
              placeholder="Nexora Sales Bot"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-xs"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">URL Avatar del Bot (Opcional)</label>
            <input
              type="url"
              placeholder="https://tudominio.com/logo.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-xs"
            />
          </div>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg border flex items-start gap-2 ${testResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
            {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            <div className="text-xs">{testResult.message}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <Button type="button" variant="outline" size="sm" onClick={handleTest} disabled={testing || !webhookUrl.trim()}>
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
            Probar Conexión
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Integración"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default DiscordConfigModal
