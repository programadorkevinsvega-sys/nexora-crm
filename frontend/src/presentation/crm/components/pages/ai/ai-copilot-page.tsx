"use client"

import { useState, useEffect } from "react"
import {
  Sparkles,
  TrendingUp,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Send,
  RefreshCw,
  Zap,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { ApiAiRepository } from "@/src/infrastructure/crm/repositories/ai/api-ai.repository"
import { api } from "@/src/infrastructure/crm/api/api-client"
import type { DealWinProbability, GeneratedMessageDraft, ContactExecutiveSummary } from "@crm/contracts"

export function AiCopilotPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedDealId, setSelectedDealId] = useState<string>("")
  const [selectedContactId, setSelectedContactId] = useState<string>("")

  const [winProb, setWinProb] = useState<DealWinProbability | null>(null)
  const [loadingWinProb, setLoadingWinProb] = useState(false)

  // Message Generator
  const [channel, setChannel] = useState<"EMAIL" | "WHATSAPP" | "NOTE">("EMAIL")
  const [tone, setTone] = useState<"FORMAL" | "FRIENDLY" | "PERSUASIVE" | "URGENT">("PERSUASIVE")
  const [objective, setObjective] = useState<any>("FOLLOW_UP")
  const [customInstructions, setCustomInstructions] = useState("")
  const [draft, setDraft] = useState<GeneratedMessageDraft | null>(null)
  const [generatingDraft, setGeneratingDraft] = useState(false)
  const [copied, setCopied] = useState(false)

  // Executive Summary
  const [summary, setSummary] = useState<ContactExecutiveSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [dList, cList] = await Promise.all([
        api.get<any>("/api/pipelines/deals").catch(() => []),
        api.get<any>("/api/contacts").catch(() => ({ data: [] })),
      ])
      const dealsArr = Array.isArray(dList) ? dList : dList.data || []
      const contactsArr = Array.isArray(cList) ? cList : cList.data || []
      setDeals(dealsArr)
      setContacts(contactsArr)

      if (dealsArr.length > 0) setSelectedDealId(dealsArr[0].id)
      if (contactsArr.length > 0) setSelectedContactId(contactsArr[0].id)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!selectedDealId) return
    setLoadingWinProb(true)
    ApiAiRepository.getDealWinProbability(selectedDealId)
      .then(setWinProb)
      .catch(console.error)
      .finally(() => setLoadingWinProb(false))
  }, [selectedDealId])

  useEffect(() => {
    if (!selectedContactId) return
    setLoadingSummary(true)
    ApiAiRepository.getContactExecutiveSummary(selectedContactId)
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoadingSummary(false))
  }, [selectedContactId])

  const handleGenerateDraft = async () => {
    try {
      setGeneratingDraft(true)
      const res = await ApiAiRepository.generateMessageDraft({
        contactId: selectedContactId || undefined,
        dealId: selectedDealId || undefined,
        channel,
        tone,
        objective,
        customInstructions: customInstructions || undefined,
      })
      setDraft(res)
    } catch (err: any) {
      alert(`Error al generar mensaje: ${err?.message}`)
    } finally {
      setGeneratingDraft(false)
    }
  }

  const handleCopy = () => {
    if (!draft) return
    const textToCopy = draft.subject ? `Asunto: ${draft.subject}\n\n${draft.bodyText}` : draft.bodyText
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" /> Nexus AI Copilot & Predictive Intelligence
          </h1>
          <p className="text-xs text-muted-foreground">
            Modelos predictivos de probabilidad de cierre, redacción asistida con contexto real y resúmenes ejecutivos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Predictive Win Probability */}
        <Card className="p-5 border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Probabilidad Predictiva de Cierre
            </h2>
            <select
              value={selectedDealId}
              onChange={(e) => setSelectedDealId(e.target.value)}
              className="p-1.5 text-xs rounded border bg-background max-w-[200px]"
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>{d.name || "Deal"}</option>
              ))}
            </select>
          </div>

          {loadingWinProb ? (
            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Analizando oportunidad con IA...</div>
          ) : winProb ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border">
                <div>
                  <div className="text-[11px] text-muted-foreground">Probabilidad Calculada</div>
                  <div className="text-2xl font-black text-foreground flex items-baseline gap-1">
                    {winProb.winProbabilityPercent}%
                    <span className="text-xs font-normal text-muted-foreground">de probabilidad</span>
                  </div>
                </div>
                <Badge variant={winProb.dealHealth === "EXCELLENT" ? "default" : winProb.dealHealth === "GOOD" ? "secondary" : "outline"}>
                  Salud: {winProb.dealHealth}
                </Badge>
              </div>

              <div>
                <span className="font-semibold text-emerald-600">Factores Favorables (+):</span>
                <ul className="mt-1 space-y-1">
                  {winProb.positiveFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {winProb.riskFactors.length > 0 && (
                <div>
                  <span className="font-semibold text-rose-600">Factores de Riesgo (-):</span>
                  <ul className="mt-1 space-y-1">
                    {winProb.riskFactors.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-foreground">
                <span className="font-bold flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" /> Próxima Acción Recomendada:</span>
                <p className="text-[11px] mt-1">{winProb.recommendedNextActions[0]}</p>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Panel 2: Executive Summary & Sentiment */}
        <Card className="p-5 border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-500" /> Resumen Ejecutivo & Sentimiento
            </h2>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="p-1.5 text-xs rounded border bg-background max-w-[200px]"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          {loadingSummary ? (
            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Sintetizando interacciones del cliente...</div>
          ) : summary ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sentimiento de la Relación:</span>
                <Badge variant={summary.sentiment === "POSITIVE" ? "default" : "secondary"}>
                  {summary.sentiment}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded border">
                {summary.summary}
              </p>
              <div>
                <span className="font-semibold text-foreground">Estrategia Sugerida:</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{summary.recommendedStrategy}</p>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Panel 3: AI Message Generator */}
      <Card className="p-5 border shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-primary" /> Asistente de Redacción Asistida con Contexto Real
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium mb-1">Canal de Envío</label>
            <select value={channel} onChange={(e: any) => setChannel(e.target.value)} className="w-full p-2 border rounded bg-background text-xs">
              <option value="EMAIL">Email Corporativo</option>
              <option value="WHATSAPP">WhatsApp Directo</option>
              <option value="NOTE">Nota Interna</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Tono del Mensaje</label>
            <select value={tone} onChange={(e: any) => setTone(e.target.value)} className="w-full p-2 border rounded bg-background text-xs">
              <option value="PERSUASIVE">Persuasivo & Enfocado a Cierre</option>
              <option value="FORMAL">Formal & Ejecutivo</option>
              <option value="FRIENDLY">Amigable & Cercano</option>
              <option value="URGENT">Urgente / Tiempo Límite</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Objetivo del Mensaje</label>
            <select value={objective} onChange={(e: any) => setObjective(e.target.value)} className="w-full p-2 border rounded bg-background text-xs">
              <option value="FOLLOW_UP">Seguimiento de Propuesta Comercial</option>
              <option value="PROPOSAL_INTRODUCTION">Presentación de Oferta Personalizada</option>
              <option value="CONTRACT_SIGNING">Solicitud de Firma Electrónica</option>
              <option value="PAYMENT_REMINDER">Recordatorio de Pago / Factura</option>
              <option value="RE_ENGAGEMENT">Reactivación de Cliente Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleGenerateDraft} disabled={generatingDraft}>
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
            {generatingDraft ? "Generando con IA..." : "Redactar Mensaje"}
          </Button>
        </div>

        {draft && (
          <div className="space-y-2 border rounded-md p-4 bg-muted/10 text-xs">
            {draft.subject && (
              <div className="border-b pb-2">
                <span className="font-bold text-foreground">Asunto: </span>
                <span className="text-muted-foreground">{draft.subject}</span>
              </div>
            )}
            <div className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
              {draft.bodyText}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5 mr-1" /> {copied ? "Copiado!" : "Copiar Texto"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
