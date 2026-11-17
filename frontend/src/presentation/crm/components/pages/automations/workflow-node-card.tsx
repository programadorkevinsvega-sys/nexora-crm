"use client"

import React from "react"
import {
  MessageSquare, Mail, Smartphone, Send, CheckSquare, Globe,
  TrendingUp, Flame, Clock, ShieldCheck, Zap, Trash2, Sparkles, GripVertical,
} from "lucide-react"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import type { CanvasNode } from "./workflow-types"

interface WorkflowNodeCardProps {
  node: CanvasNode
  index: number
  isSelected: boolean
  isSimulating?: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
  onMouseDownCard: (e: React.MouseEvent) => void
  onStartConnect: (port: "output" | "true" | "false", e: React.MouseEvent) => void
  onDropConnect?: (e: React.MouseEvent) => void
}

export function WorkflowNodeCard({
  node,
  index,
  isSelected,
  isSimulating,
  onClick,
  onDelete,
  onMouseDownCard,
  onStartConnect,
  onDropConnect,
}: WorkflowNodeCardProps) {
  const getActionIcon = () => {
    switch (node.action) {
      case "SEND_WHATSAPP": return <MessageSquare className="h-4 w-4 text-emerald-400" />
      case "SEND_EMAIL": return <Mail className="h-4 w-4 text-blue-400" />
      case "SEND_SMS": return <Smartphone className="h-4 w-4 text-indigo-400" />
      case "AI_DRAFT_MESSAGE": return <Sparkles className="h-4 w-4 text-purple-400" />
      case "SEND_SLACK": return <Zap className="h-4 w-4 text-amber-400" />
      case "SEND_DISCORD": return <Send className="h-4 w-4 text-purple-400" />
      case "SYNC_ACCOUNTING": return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case "CREATE_TASK": return <CheckSquare className="h-4 w-4 text-amber-400" />
      case "TRIGGER_WEBHOOK": return <Globe className="h-4 w-4 text-rose-400" />
      case "UPDATE_LEAD_SCORE": return <Flame className="h-4 w-4 text-orange-400" />
      default: return <Zap className="h-4 w-4 text-primary" />
    }
  }

  const isDelay = node.type === "DELAY"
  const isCondition = node.type === "CONDITION"

  return (
    <div
      style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
      className={`absolute w-64 rounded-2xl border p-3.5 bg-card/95 backdrop-blur-md shadow-xl select-none transition-shadow duration-150 z-10 ${
        isSelected
          ? "ring-2 ring-cyan-400 border-cyan-400 shadow-cyan-500/20 shadow-2xl z-20"
          : "hover:border-primary/60 hover:shadow-2xl"
      } ${isSimulating ? "ring-4 ring-emerald-400 scale-105 shadow-emerald-500/50 shadow-2xl z-30" : ""}`}
      onClick={onClick}
    >
      {/* Left Input Port */}
      <div
        data-node-id={node.id}
        data-port-type="input"
        onClick={(e) => { e.stopPropagation(); onDropConnect?.(e) }}
        className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-border hover:bg-cyan-400 border-2 border-background shadow-md cursor-crosshair flex items-center justify-center transition-colors group"
        title="Entrada: Conectar aquí"
      >
        <div className="w-2 h-2 rounded-full bg-background group-hover:bg-cyan-900" />
      </div>

      {/* Card Header with Drag Handle */}
      <div
        onMouseDown={onMouseDownCard}
        className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60" />
          {isDelay ? (
            <Clock className="h-4 w-4 text-amber-400" />
          ) : isCondition ? (
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          ) : (
            getActionIcon()
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Paso {index + 1}
          </span>
        </div>

        <button
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors"
          title="Eliminar nodo"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Card Content */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-foreground truncate">
          {node.name || node.action || (isDelay ? `Esperar ${node.duration}` : "Regla Condicional")}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {isDelay
            ? `Pausa por ${node.duration || "1h"}`
            : isCondition
            ? `${node.condition?.field || "Condición"} ${node.condition?.operator || "=="} ${node.condition?.value ?? ""}`
            : (node.config?.payload as string) || `Ejecuta ${node.action}`}
        </p>
      </div>

      {/* Footer / Badge */}
      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
        <Badge variant={isDelay ? "warning" : isCondition ? "info" : "default"} size="sm">
          {isDelay ? "TEMPORIZADOR" : isCondition ? "CONDICIÓN" : "ACCIÓN CRM"}
        </Badge>
        <span className="text-[10px] text-muted-foreground font-mono">ID: {node.id.slice(-6)}</span>
      </div>

      {/* Right Output Ports */}
      {isCondition ? (
        <>
          {/* True Output Port (Green) */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); onStartConnect("true", e) }}
            className="absolute -right-2.5 top-1/3 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 border-2 border-background shadow-md cursor-crosshair flex items-center justify-center transition-transform hover:scale-125"
            title="Salida: Si cumple la condición (True)"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-background" />
          </div>

          {/* False Output Port (Red) */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); onStartConnect("false", e) }}
            className="absolute -right-2.5 top-2/3 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 border-2 border-background shadow-md cursor-crosshair flex items-center justify-center transition-transform hover:scale-125"
            title="Salida: Si NO cumple la condición (False)"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-background" />
          </div>
        </>
      ) : (
        /* Standard Output Port (Cyan) */
        <div
          onMouseDown={(e) => { e.stopPropagation(); onStartConnect("output", e) }}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-500 hover:bg-cyan-400 border-2 border-background shadow-md cursor-crosshair flex items-center justify-center transition-transform hover:scale-125"
          title="Salida: Conectar con siguiente paso"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-background" />
        </div>
      )}
    </div>
  )
}

export default WorkflowNodeCard
