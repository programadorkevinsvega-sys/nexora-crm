"use client"

import React from "react"
import { X, Settings, Trash2, Check, Clock, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import type { WorkflowStep } from "@/src/domain/crm/automation/workflow.entity"

interface WorkflowNodeInspectorProps {
  step: WorkflowStep
  index: number
  onUpdate: (updated: WorkflowStep) => void
  onDelete: () => void
  onClose: () => void
}

const CONDITION_FIELDS = [
  { value: "contact.leadScore", label: "Puntuación de Lead (Score)" },
  { value: "contact.leadSource", label: "Origen del Prospecto (Source)" },
  { value: "deal.amount", label: "Monto del Trato ($)" },
  { value: "deal.stageId", label: "Etapa del Pipeline" },
  { value: "contact.email", label: "Correo Electrónico" },
]

export function WorkflowNodeInspector({
  step,
  index,
  onUpdate,
  onDelete,
  onClose,
}: WorkflowNodeInspectorProps) {
  const isDelay = step.type === "DELAY"
  const isCondition = step.type === "CONDITION"
  const isAction = step.type === "ACTION"

  return (
    <div className="w-80 border-l border-border bg-card/95 backdrop-blur-md p-4 flex flex-col h-full shadow-2xl z-30 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Settings className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Configurar Paso {index + 1}
            </h3>
            <p className="text-[10px] text-muted-foreground">{step.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body Inputs */}
      <div className="flex-1 overflow-y-auto space-y-4 text-xs">
        {/* Name */}
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Nombre del Paso</label>
          <input
            type="text"
            value={step.name || ""}
            onChange={(e) => onUpdate({ ...step, name: e.target.value })}
            className="w-full p-2 border rounded-md bg-background text-xs"
            placeholder="Nombre identificador..."
          />
        </div>

        {/* Delay Configuration */}
        {isDelay && (
          <div className="space-y-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs">
              <Clock className="h-3.5 w-3.5" /> Tiempo de Espera
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Duración (ej: 15m, 1h, 24h, 7d)</label>
              <input
                type="text"
                value={step.duration || "1h"}
                onChange={(e) => onUpdate({ ...step, duration: e.target.value })}
                className="w-full p-2 border rounded-md bg-background text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Condition Configuration */}
        {isCondition && (
          <div className="space-y-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <div className="flex items-center gap-1.5 text-purple-500 font-semibold text-xs">
              <ShieldCheck className="h-3.5 w-3.5" /> Regla de Bifurcación (IF / THEN)
            </div>

            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">Campo a Evaluar</label>
              <select
                value={step.condition?.field || CONDITION_FIELDS[0].value}
                onChange={(e) =>
                  onUpdate({
                    ...step,
                    condition: {
                      field: e.target.value,
                      operator: step.condition?.operator || "EQUALS",
                      value: step.condition?.value ?? 0,
                    },
                  })
                }
                className="w-full p-2 border rounded-md bg-background text-xs"
              >
                {CONDITION_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Operador</label>
                <select
                  value={step.condition?.operator || "EQUALS"}
                  onChange={(e) =>
                    onUpdate({
                      ...step,
                      condition: {
                        field: step.condition?.field || "contact.leadScore",
                        operator: e.target.value as any,
                        value: step.condition?.value ?? 0,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-md bg-background text-xs font-mono"
                >
                  <option value="EQUALS">== Igual</option>
                  <option value="GREATER_THAN">&gt; Mayor</option>
                  <option value="LESS_THAN">&lt; Menor</option>
                  <option value="CONTAINS">Contiene</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Valor</label>
                <input
                  type="text"
                  value={String(step.condition?.value ?? "")}
                  onChange={(e) =>
                    onUpdate({
                      ...step,
                      condition: {
                        field: step.condition?.field || "contact.leadScore",
                        operator: step.condition?.operator || "EQUALS",
                        value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 border rounded-md bg-background text-xs font-mono"
                  placeholder="80, VIP..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Configuration */}
        {isAction && (
          <div className="space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
              <Zap className="h-3.5 w-3.5" /> Mensaje / Plantilla
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">Contenido o Mensaje</label>
              <textarea
                rows={4}
                value={String(step.config?.payload || step.config?.title || "")}
                onChange={(e) =>
                  onUpdate({
                    ...step,
                    config: { ...step.config, payload: e.target.value, title: e.target.value },
                  })
                }
                placeholder="Escribe el mensaje o plantilla dinámica..."
                className="w-full p-2 border rounded-md bg-background text-xs font-sans"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:bg-destructive/10 text-xs">
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
        </Button>
        <Button size="sm" onClick={onClose} className="text-xs">
          <Check className="h-3.5 w-3.5 mr-1" /> Listo
        </Button>
      </div>
    </div>
  )
}

export default WorkflowNodeInspector
