"use client"

import React, { useState, useEffect } from "react"
import { Copy, Check, Play, Smartphone, Sparkles, ExternalLink, RefreshCw, Zap, ShieldCheck } from "lucide-react"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { api } from "@/src/infrastructure/crm/api/api-client"

interface TiktokStatus {
  status: "CONNECTED" | "DISCONNECTED"
  webhookUrl: string
  leadsReceived: number
  lastLeadAt?: string | null
}

export function TiktokLeadsPage() {
  const [status, setStatus] = useState<TiktokStatus | null>(null)
  const [copied, setCopied] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [simulationLog, setSimulationLog] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const data = await api.get<TiktokStatus>("/api/integrations/tiktok/status")
      setStatus(data)
    } catch {
      setStatus({
        status: "DISCONNECTED",
        webhookUrl: typeof window !== "undefined" ? `${window.location.origin}/api/integrations/tiktok/webhook` : "",
        leadsReceived: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleCopy = () => {
    if (navigator?.clipboard && status?.webhookUrl) {
      navigator.clipboard.writeText(status.webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSimulate = async () => {
    try {
      setSimulating(true)
      setSimulationLog(null)
      const randomPhone = `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`
      const payload = {
        name: "Prospecto TikTok Simulado",
        email: `lead_${Date.now()}@tiktok-lead.com`,
        phone_number: randomPhone,
        ad_name: "Campaña TikTok Ads 2026",
      }

      await api.post("/api/integrations/tiktok/webhook", payload)
      setSimulationLog(`¡Lead recibido con éxito! Creado contacto: ${payload.name} (${payload.phone_number})`)
      await fetchStatus()
    } catch (err: any) {
      setSimulationLog(`Error al simular: ${err.message}`)
    } finally {
      setSimulating(false)
    }
  }

  const isConnected = status?.status === "CONNECTED" || (status?.leadsReceived ?? 0) > 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="TikTok Lead Generation & Instant Forms"
        description="Captura prospectos en vivo desde anuncios de TikTok y sincronízalos al instante en Contactos y Deals."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulate}
              disabled={simulating}
              className="gap-1.5 text-xs text-pink-400 border-pink-500/30 hover:bg-pink-500/10"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {simulating ? "Simulando..." : "Simular Lead de TikTok"}
            </Button>
          </div>
        }
      />

      {/* Main Connection Status Card */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center shadow-lg shadow-pink-500/10">
                <Smartphone className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-100">TikTok Instant Forms Webhook</h3>
                  <Badge variant={isConnected ? "success" : "default"}>
                    {isConnected ? "Conectado en Vivo" : "Esperando Primer Lead"}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">Recepción directa en milisegundos sin intermediarios de pago</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Leads Recibidos: <strong>{status?.leadsReceived ?? 0}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Último Lead: <strong>{status?.lastLeadAt ? new Date(status.lastLeadAt).toLocaleTimeString() : "Ninguno aún"}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {simulationLog && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs animate-in fade-in flex items-center justify-between">
          <span>{simulationLog}</span>
          <span className="font-mono text-[10px]">OK</span>
        </div>
      )}

      {/* Webhook Configuration Box */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2 text-zinc-100">
          <Sparkles className="h-4 w-4 text-pink-400" />
          Configuración en TikTok Ads Manager
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">URL del Webhook (Catch URL):</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={status?.webhookUrl || ""}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 font-mono text-xs text-cyan-300 select-all"
            />
            <Button onClick={handleCopy} size="sm" className="bg-pink-600 hover:bg-pink-500 text-white gap-1.5 h-10 px-4">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs text-zinc-300">
          <div className="font-semibold text-zinc-100">Instrucciones de Vinculación:</div>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 text-xs">
            <li>Inicia sesión en <a href="https://ads.tiktok.com/" target="_blank" rel="noreferrer" className="text-pink-400 underline inline-flex items-center gap-0.5">TikTok Ads Manager <ExternalLink className="h-3 w-3 inline" /></a>.</li>
            <li>Dirígete a <strong>Herramientas</strong> → <strong>Generación de Clientes Potenciales</strong> → <strong>Formularios Instantáneos</strong>.</li>
            <li>En la pestaña de <strong>Webhooks</strong>, pega la URL indicada arriba.</li>
            <li>Selecciona el evento <code>lead</code> y guarda la configuración.</li>
            <li>Al publicarse tu anuncio, cada prospecto se registrará en el CRM con la etiqueta <span className="text-pink-400 font-mono">tiktok-lead</span>.</li>
          </ol>
        </div>
      </Card>
    </div>
  )
}
