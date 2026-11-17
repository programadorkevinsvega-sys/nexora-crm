"use client"

import React, { useState } from "react"
import { Plus, Trash2, Bot, MessageSquare, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import type { SocialAutoResponderRule } from "@crm/contracts"

interface SocialAutoResponderRulesProps {
  rules: SocialAutoResponderRule[]
  onSaveRule: (rule: Partial<SocialAutoResponderRule>) => Promise<void>
  onDeleteRule: (id: string) => Promise<void>
}

export function SocialAutoResponderRules({
  rules,
  onSaveRule,
  onDeleteRule,
}: SocialAutoResponderRulesProps) {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState("")
  const [platform, setPlatform] = useState<"ALL" | "FACEBOOK" | "INSTAGRAM" | "TIKTOK">("ALL")
  const [keywords, setKeywords] = useState("")
  const [responseMode, setResponseMode] = useState<"STATIC_TEMPLATE" | "AI_BOT">("AI_BOT")
  const [staticReplies, setStaticReplies] = useState("¡Hola {name}! Te enviamos la información completa por privado 🚀")
  const [aiPrompt, setAiPrompt] = useState("Eres el asistente de ventas. Responde amablemente invitando al usuario a revisar su buzón privado.")
  const [sendPrivateDm, setSendPrivateDm] = useState(true)
  const [autoCreateLead, setAutoCreateLead] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const parsedKeywords = keywords.split(",").map((k) => k.trim()).filter(Boolean)
      const parsedReplies = staticReplies.split("\n").map((r) => r.trim()).filter(Boolean)

      await onSaveRule({
        name: name.trim(),
        platform,
        triggerKeywords: parsedKeywords,
        responseMode,
        staticReplies: parsedReplies,
        aiPrompt: responseMode === "AI_BOT" ? aiPrompt.trim() : undefined,
        sendPrivateDm,
        autoCreateLead,
        isEnabled: true,
      })

      setShowModal(false)
      setName("")
      setKeywords("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Reglas & Pipelines de Autorespuesta Automática</h3>
          <p className="text-xs text-muted-foreground">Configura bots inteligentes con IA o respuestas predeterminadas para publicaciones y anuncios</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nueva Regla de Autorespuesta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-5 space-y-3.5 bg-card hover:border-border transition">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground">{rule.name}</h4>
                  <Badge variant={rule.responseMode === "AI_BOT" ? "info" : "default"} size="sm">
                    {rule.responseMode === "AI_BOT" ? "🧠 Bot con IA (LLM)" : "📋 Plantilla Estática"}
                  </Badge>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Canal: {rule.platform}
                </span>
              </div>

              <button
                onClick={() => onDeleteRule(rule.id)}
                className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground font-medium">Palabras Clave Disparadoras:</span>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {rule.triggerKeywords.length > 0 ? (
                  rule.triggerKeywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-primary border">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-[11px]">Todos los comentarios (*)</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{rule.autoCreateLead ? "✅ Crea Contacto & Deal" : "Sin crear Lead"}</span>
              <span className="text-emerald-500 font-semibold">● Activa en vivo</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Crear Regla de Autorespuesta (Bot / IA)">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">Nombre de la Regla *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Autorespuesta a preguntas de Precio en Anuncios"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Plataforma</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
              >
                <option value="ALL">Todas las Redes (Facebook, IG, TikTok)</option>
                <option value="FACEBOOK">Solo Facebook (Posts & Ads)</option>
                <option value="INSTAGRAM">Solo Instagram (Reels & Ads)</option>
                <option value="TIKTOK">Solo TikTok (Videos & Ads)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Modo de Respuesta</label>
              <select
                value={responseMode}
                onChange={(e) => setResponseMode(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold"
              >
                <option value="AI_BOT">🧠 Inteligencia Artificial (Copilot LLM)</option>
                <option value="STATIC_TEMPLATE">📋 Plantillas Estáticas Aleatorias</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Palabras Clave (Separadas por comas)</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="precio, costo, info, dm, comprar, demo"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono"
            />
          </div>

          {responseMode === "AI_BOT" ? (
            <div>
              <label className="block font-medium text-foreground mb-1">Instrucciones / Prompt para la IA</label>
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="block font-medium text-foreground mb-1">Respuestas Estáticas (Una por línea, usa {'{name}'})</label>
              <textarea
                rows={2}
                value={staticReplies}
                onChange={(e) => setStaticReplies(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Crear Regla"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
