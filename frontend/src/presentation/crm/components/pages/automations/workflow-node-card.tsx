"use client"

import React from "react"
import {
  MessageSquare,
  Mail,
  Smartphone,
  Send,
  CheckSquare,
  Globe,
  TrendingUp,
  Flame,
  Clock,
  ShieldCheck,
  Zap,
  Trash2,
} from "lucide-react"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import type { WorkflowStep } from "@/src/domain/crm/automation/workflow.entity"

interface WorkflowNodeCardProps {
  step: WorkflowStep
  index: number
  isSelected: boolean
  isSimulating?: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}

export function WorkflowNodeCard({
  step,
  index,
  isSelected,
  isSimulating,
  onClick,
  onDelete,
}: WorkflowNodeCardProps) {
  const getActionIcon = () => {
    switch (step.action) {
      case "SEND_WHATSAPP": return <MessageSquare className="h-4 w-4 text-emerald-500" />
      case "SEND_EMAIL": return <Mail className="h-4 w-4 text-blue-500" />
      case "SEND_SMS": return <Smartphone className="h-4 w-4 text-indigo-500" />
      case "SEND_SLACK": return <Zap className="h-4 w-4 text-amber-500" />
      case "SEND_DISCORD": return <Send className="h-4 w-4 text-purple-500" />
      case "SYNC_ACCOUNTING": return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case "CREATE_TASK": return <CheckSquare className="h-4 w-4 text-amber-500" />
      case "TRIGGER_WEBHOOK": return <Globe className="h-4 w-4 text-rose-500" />
      case "UPDATE_LEAD_SCORE": return <Flame className="h-4 w-4 text-orange-500" />
      default: return <Zap className="h-4 w-4 text-primary" />
    }
  }

  const isDelay = step.type === "DELAY"
  const isCondition = step.type === "CONDITION"

  return (
    <div
      onClick={onClick}
      className={`relative w-64 rounded-xl border p-3.5 bg-card shadow-md cursor-pointer transition-all duration-200 select-none ${
        isSelected
          ? "ring-2 ring-cyan-500 border-cyan-500 shadow-cyan-500/20 shadow-lg"
          : "hover:border-primary/50 hover:shadow-lg"
      } ${isSimulating ? "ring-4 ring-emerald-500 scale-105 shadow-emerald-500/40" : ""}`}
    >
      {/* Top Input Anchor */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-border border-2 border-background shadow" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2">
        <div className="flex items-center gap-2">
          {isDelay ? (
            <Clock className="h-4 w-4 text-amber-500" />
          ) : isCondition ? (
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          ) : (
            getActionIcon()
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Paso {index + 1}
          </span>
        </div>

        <button
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors"
          title="Eliminar nodo"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-foreground truncate">
          {step.name || step.action || (isDelay ? `Esperar ${step.duration}` : "Regla Condicional")}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {isDelay
            ? `Pausa la ejecución por ${step.duration || "1h"}`
            : isCondition
            ? `${step.condition?.field || "Condición"} ${step.condition?.operator || "=="} ${step.condition?.value || ""}`
            : `Acción directa: ${step.action}`}
        </p>
      </div>

      {/* Footer / Status */}
      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
        <Badge variant={isDelay ? "warning" : isCondition ? "info" : "default"} size="sm">
          {isDelay ? "TEMPORIZADOR" : isCondition ? "RAMIFICACIÓN" : "EJECUCIÓN NATIVA"}
        </Badge>
        {isCondition && <span className="text-emerald-500 font-bold">Si / No 🔀</span>}
      </div>

      {/* Bottom Output Anchor */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-cyan-500 border-2 border-background shadow" />
    </div>
  )
}
