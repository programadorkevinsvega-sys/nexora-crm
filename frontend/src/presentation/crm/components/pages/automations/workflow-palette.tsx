"use client"

import React from "react"
import {
  MessageSquare,
  Mail,
  Smartphone,
  Send,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckSquare,
  Globe,
  Flame,
  Plus,
  Sparkles,
} from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import type { WorkflowStep } from "@/src/domain/crm/automation/workflow.entity"

export const PALETTE_ITEMS = [
  {
    category: "💬 Comunicación & Mensajería",
    items: [
      { type: "ACTION", action: "SEND_WHATSAPP", label: "WhatsApp Oficial", desc: "Meta Cloud API", icon: MessageSquare, color: "text-emerald-500" },
      { type: "ACTION", action: "SEND_EMAIL", label: "Email Transaccional", desc: "SMTP / AWS SES", icon: Mail, color: "text-blue-500" },
      { type: "ACTION", action: "SEND_SMS", label: "SMS Twilio", desc: "Texto directo", icon: Smartphone, color: "text-indigo-500" },
      { type: "ACTION", action: "AI_DRAFT_MESSAGE", label: "Redactar con IA Bot", desc: "Copilot RAG automático", icon: Sparkles, color: "text-purple-400" },
    ],
  },
  {
    category: "🚀 Integraciones Externas Nativas",
    items: [
      { type: "ACTION", action: "SEND_SLACK", label: "Slack Notificación", desc: "Canal o DM directo", icon: Zap, color: "text-amber-500" },
      { type: "ACTION", action: "SEND_DISCORD", label: "Discord Bot Embed", desc: "Canal con embed", icon: Send, color: "text-purple-500" },
      { type: "ACTION", action: "SYNC_ACCOUNTING", label: "Factura Contable", desc: "ERP / Facturación", icon: TrendingUp, color: "text-emerald-600" },
      { type: "ACTION", action: "TRIGGER_WEBHOOK", label: "Webhook HTTP", desc: "REST payload", icon: Globe, color: "text-rose-500" },
    ],
  },
  {
    category: "⚙️ Lógica & Control de Flujo",
    items: [
      { type: "DELAY", label: "Temporizador (Espera)", desc: "1h, 24h, 7 días", icon: Clock, color: "text-amber-500", duration: "1h" },
      { type: "CONDITION", label: "Bifurcación Condicional", desc: "Regla Si / No", icon: ShieldCheck, color: "text-purple-500" },
      { type: "ACTION", action: "CREATE_TASK", label: "Crear Tarea en CRM", desc: "Asignar a agente", icon: CheckSquare, color: "text-amber-500" },
      { type: "ACTION", action: "UPDATE_LEAD_SCORE", label: "Ajustar Lead Score", desc: "Calificación lead", icon: Flame, color: "text-orange-500" },
    ],
  },
]

interface WorkflowPaletteProps {
  onAddStep: (step: Partial<WorkflowStep>) => void
}

export function WorkflowPalette({ onAddStep }: WorkflowPaletteProps) {
  return (
    <Card className="p-3.5 space-y-4 bg-card/90 backdrop-blur w-72 border-2 border-border/80 shadow-xl overflow-y-auto max-h-[580px]">
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Paleta de Nodos</span>
          <Plus className="h-3.5 w-3.5 text-primary" />
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">Haz clic en un bloque para agregarlo al lienzo:</p>
      </div>

      <div className="space-y-3">
        {PALETTE_ITEMS.map((group) => (
          <div key={group.category} className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
              {group.category}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    onClick={() =>
                      onAddStep({
                        type: item.type as any,
                        action: (item as any).action,
                        name: item.label,
                        duration: (item as any).duration,
                      })
                    }
                    className="w-full text-left p-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/40 transition-all flex items-center gap-2.5 group"
                  >
                    <div className="p-1.5 rounded-md bg-muted/60 group-hover:bg-primary/10 transition-colors">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">{item.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
