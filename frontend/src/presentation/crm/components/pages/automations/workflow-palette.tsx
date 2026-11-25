"use client"

import React from "react"
import { Clock, ShieldCheck, Plus } from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import type { WorkflowStep } from "@/src/domain/crm/automation/workflow.entity"

type PaletteStepType = WorkflowStep['type']
type PaletteAction = WorkflowStep['action']

interface PaletteItem {
  type: PaletteStepType
  action?: PaletteAction
  label: string
  desc: string
  icon: typeof Clock | typeof ShieldCheck
  color: string
  duration?: string
}

export const PALETTE_ITEMS: Array<{ category: string; items: PaletteItem[] }> = [
  {
    category: "⚙️ Control de Flujo",
    items: [
      { type: "DELAY", label: "Temporizador (Espera)", desc: "1h, 24h, 7 días", icon: Clock, color: "text-amber-500", duration: "1h" },
      { type: "CONDITION", label: "Bifurcación Condicional", desc: "Regla Si / No", icon: ShieldCheck, color: "text-purple-500" },
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
                        type: item.type,
                        ...(item.action ? { action: item.action } : {}),
                        name: item.label,
                        ...(item.duration ? { duration: item.duration } : {}),
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
