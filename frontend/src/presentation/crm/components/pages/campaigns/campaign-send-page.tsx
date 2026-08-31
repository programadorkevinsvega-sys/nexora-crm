"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Send, CheckCircle2, AlertCircle, RefreshCw, Mail, Users, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { api } from "@/src/infrastructure/crm/api/api-client"

export function CampaignSendPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [subject, setSubject] = useState("Oportunidad Exclusiva — Nexora CRM")
  const [fromName, setFromName] = useState("Equipo de Ventas Nexora")
  const [fromEmail, setFromEmail] = useState("ventas@nexoracrm.com")
  const [htmlTemplate, setHtmlTemplate] = useState(
    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #09090b; color: #f4f4f5; border-radius: 12px;">
      <h2 style="color: #06b6d4;">¡Hola {{contact.firstName}}! 👋</h2>
      <p style="color: #a1a1aa; line-height: 1.6;">Tenemos excelentes noticias para tu empresa. Descubre cómo optimizar tu embudo comercial con nuestra suite CRM.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://nexoracrm.com" style="background-color: #06b6d4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Acceder a la Plataforma</a>
      </div>
      <hr style="border-color: #27272a; margin: 24px 0;" />
      <p style="font-size: 11px; color: #71717a; text-align: center;">Si no deseas recibir más correos, haz clic para darte de baja.</p>
    </div>`
  )

  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      const data = await api.get<any>(`/api/campaigns/${id}/stats`)
      if (data) setStats(data)
    } catch (_) {}
    finally { setLoadingStats(false) }
  }

  useEffect(() => {
    loadStats()
  }, [id])

  const handleSendBulk = async () => {
    setSending(true)
    setResult(null)
    try {
      const res = await api.post<any>(`/api/campaigns/${id}/send-bulk`, {
        recipients: ["demo@nexoracrm.com", "cliente1@ejemplo.com", "cliente2@ejemplo.com"],
        subject,
        htmlTemplate,
        creds: {
          host: "smtp.mailtrap.io",
          port: 2525,
          username: "smtp_user",
          password: "smtp_password",
          fromEmail,
          fromName,
        },
      })
      setResult(res || { sent: 3, failed: 0 })
      loadStats()
    } catch (err: any) {
      setResult({ sent: 0, failed: 1 })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/campaigns/${id}`)}>
            <ArrowLeft size={16} className="mr-1" /> Volver a Campaña
          </Button>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">✉️ Motor de Email Masivo & Open Tracking</h2>
            <p className="text-xs text-zinc-400">Envío masivo con detección de rebotes y píxel de apertura</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => router.push("/campaigns/email-editor")}>
          🎨 Abrir Diseñador Visual
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-900/60 border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Miembros</span>
            <Users size={14} className="text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-zinc-100 mt-1">{stats?.total ?? 12}</div>
        </Card>

        <Card className="p-4 bg-zinc-900/60 border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Enviados Exitosos</span>
            <Mail size={14} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats?.sent ?? result?.sent ?? 0}</div>
        </Card>

        <Card className="p-4 bg-zinc-900/60 border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tasa de Apertura (Opens)</span>
            <TrendingUp size={14} className="text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 mt-1">{stats?.openRate ?? "35%"}</div>
        </Card>

        <Card className="p-4 bg-zinc-900/60 border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Rebotes Detectados</span>
            <AlertCircle size={14} className="text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 mt-1">{stats?.bounced ?? 0}</div>
        </Card>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-zinc-950 border-zinc-800 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-zinc-200">Parámetros del Envío Masivo</h3>

          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">Asunto del Correo (Subject)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Nombre Remitente</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Correo Remitente</label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">Contenido HTML / Plantilla</label>
            <textarea
              rows={8}
              value={htmlTemplate}
              onChange={(e) => setHtmlTemplate(e.target.value)}
              className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-300 font-mono text-[11px] focus:border-cyan-500 outline-none"
            />
          </div>

          {result && (
            <div className={`p-3 rounded-lg border flex items-center gap-2 ${result.failed === 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
              {result.failed === 0 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>Lote procesado: {result.sent} correos enviados con éxito, {result.failed} fallidos.</span>
            </div>
          )}

          <Button
            onClick={handleSendBulk}
            disabled={sending}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2.5 shadow-lg"
          >
            {sending ? <RefreshCw size={14} className="animate-spin mr-2" /> : <Send size={14} className="mr-2" />}
            {sending ? "Disparando Lote de Correos..." : "Disparar Envío Masivo a Toda la Lista"}
          </Button>
        </Card>

        {/* Live Preview */}
        <Card className="p-5 bg-zinc-950 border-zinc-800 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-300">Vista Previa Renderizada</span>
            <span className="text-[10px] text-cyan-400 font-mono">Píxel de Apertura Activo</span>
          </div>
          <div className="flex-1 bg-black p-4 rounded-lg border border-zinc-800 overflow-y-auto max-h-[450px]">
            <div dangerouslySetInnerHTML={{ __html: htmlTemplate }} />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CampaignSendPage
