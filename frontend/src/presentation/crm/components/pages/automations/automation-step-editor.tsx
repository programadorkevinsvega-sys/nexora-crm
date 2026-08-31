"use client"

import {
  MessageSquare,
  Mail,
  Smartphone,
  Send,
  CheckSquare,
  Globe,
  TrendingUp,
  Flame,
  Bell,
  Clock,
  ShieldCheck,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import type { WorkflowStep, StepType } from "@/src/domain/crm/automation/workflow.entity"

export const ACTION_TYPES = [
  { value: "SEND_WHATSAPP", label: "💬 WhatsApp", icon: MessageSquare, color: "text-emerald-500" },
  { value: "SEND_EMAIL", label: "✉️ Email", icon: Mail, color: "text-blue-500" },
  { value: "SEND_SMS", label: "📱 SMS (Texto)", icon: Smartphone, color: "text-indigo-500" },
  { value: "SEND_TELEGRAM", label: "✈️ Telegram", icon: Send, color: "text-sky-500" },
  { value: "SEND_MESSENGER", label: "💬 Messenger", icon: MessageSquare, color: "text-purple-500" },
  { value: "CREATE_TASK", label: "📋 Crear Tarea", icon: CheckSquare, color: "text-amber-500" },
  { value: "TRIGGER_WEBHOOK", label: "🌐 Webhook HTTP", icon: Globe, color: "text-rose-500" },
  { value: "UPDATE_DEAL_STAGE", label: "🎯 Cambiar Etapa Deal", icon: TrendingUp, color: "text-cyan-500" },
  { value: "UPDATE_LEAD_SCORE", label: "⭐ Ajustar Lead Score", icon: Flame, color: "text-orange-500" },
  { value: "SEND_NOTIFICATION", label: "🔔 Notificación Push", icon: Bell, color: "text-yellow-500" },
]

export const DELAY_PRESETS = [
  { value: "1m", label: "1m (1 Minuto)" },
  { value: "5m", label: "5m (5 Minutos)" },
  { value: "15m", label: "15m (15 Minutos)" },
  { value: "30m", label: "30m (30 Minutos)" },
  { value: "1h", label: "1h (1 Hora)" },
  { value: "2h", label: "2h (2 Horas)" },
  { value: "12h", label: "12h (12 Horas)" },
  { value: "24h", label: "24h (1 Día)" },
  { value: "48h", label: "48h (2 Días)" },
  { value: "7d", label: "7d (1 Semana)" },
]

export const CONDITION_FIELDS = [
  { value: "contact.leadScore", label: "Lead Score (Puntuación)" },
  { value: "deal.amount", label: "Deal Amount (Monto de Venta)" },
  { value: "contact.jobTitle", label: "Job Title (Cargo/Cargo C-Level)" },
  { value: "contact.country", label: "Country (País)" },
  { value: "company.numberOfEmployees", label: "Company Size (Empleados)" },
]

interface StepEditorProps {
  step: WorkflowStep
  index: number
  totalSteps: number
  onChange: (updated: WorkflowStep) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function WorkflowStepEditorCard({
  step,
  index,
  totalSteps,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: StepEditorProps) {
  const currentAction = ACTION_TYPES.find((a) => a.value === (step.action || "SEND_EMAIL")) || ACTION_TYPES[1]
  const IconComponent = step.type === "ACTION" ? currentAction.icon : step.type === "DELAY" ? Clock : ShieldCheck

  return (
    <Card className="p-4 space-y-3 border-l-4 border-l-primary shadow-sm bg-card">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${step.type === "ACTION" ? currentAction.color : step.type === "DELAY" ? "text-amber-500" : "text-purple-500"}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            PASO {index + 1}: {step.type}
          </span>
          <Badge variant={step.type === "ACTION" ? "default" : step.type === "DELAY" ? "secondary" : "outline"}>
            {step.type === "ACTION" ? currentAction.label : step.type === "DELAY" ? `⏱️ Espera ${step.duration || "1h"}` : "⚖️ Regla Condicional"}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {onMoveUp && index > 0 && (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onMoveUp} title="Subir paso">
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          {onMoveDown && index < totalSteps - 1 && (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onMoveDown} title="Bajar paso">
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={onRemove} title="Eliminar paso">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Step Name */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground mb-1">Nombre Descriptivo del Paso</label>
        <input
          type="text"
          className="w-full px-3 py-1.5 border rounded-md text-xs bg-background"
          placeholder="e.g. Enviar WhatsApp de Bienvenida"
          value={step.name || ""}
          onChange={(e) => onChange({ ...step, name: e.target.value })}
        />
      </div>

      {/* ACTION Configuration */}
      {step.type === "ACTION" && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Canal / Tipo de Acción</label>
              <select
                className="w-full px-3 py-1.5 border rounded-md text-xs bg-background font-medium"
                value={step.action || "SEND_EMAIL"}
                onChange={(e) =>
                  onChange({
                    ...step,
                    action: e.target.value,
                    name: step.name || ACTION_TYPES.find((a) => a.value === e.target.value)?.label,
                  })
                }
              >
                {ACTION_TYPES.map((act) => (
                  <option key={act.value} value={act.value}>
                    {act.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                {step.action?.includes("EMAIL")
                  ? "Asunto del Correo"
                  : step.action?.includes("WEBHOOK")
                  ? "URL del Webhook (POST)"
                  : step.action?.includes("TASK")
                  ? "Título de la Tarea"
                  : step.action?.includes("SCORE")
                  ? "Puntos a Ajustar (+/-)"
                  : "Plantilla / Mensaje"}
              </label>
              <input
                type="text"
                className="w-full px-3 py-1.5 border rounded-md text-xs bg-background"
                placeholder={
                  step.action?.includes("WEBHOOK")
                    ? "https://api.tu-servicio.com/webhook"
                    : step.action?.includes("SCORE")
                    ? "+15"
                    : "Mensaje o plantilla..."
                }
                value={String(step.config?.payload || step.config?.subject || step.config?.template || step.config?.title || "")}
                onChange={(e) =>
                  onChange({
                    ...step,
                    config: { ...step.config, payload: e.target.value, subject: e.target.value, title: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* DELAY Configuration */}
      {step.type === "DELAY" && (
        <div className="space-y-2 pt-1">
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Duración de Espera (Time Wait)</label>
          <div className="flex flex-wrap gap-1.5">
            {DELAY_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                size="sm"
                variant={step.duration === preset.value ? "default" : "outline"}
                className="text-[11px] h-7 px-2"
                onClick={() => onChange({ ...step, duration: preset.value, name: `Esperar ${preset.label}` })}
              >
                {preset.value}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">Duración personalizada:</span>
            <input
              type="text"
              className="w-32 px-2 py-1 border rounded-md text-xs font-mono bg-background"
              placeholder="e.g. 15m, 48h, 3d"
              value={step.duration || "1h"}
              onChange={(e) => onChange({ ...step, duration: e.target.value, name: `Esperar ${e.target.value}` })}
            />
          </div>
        </div>
      )}

      {/* CONDITION Configuration */}
      {step.type === "CONDITION" && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Campo a Evaluar</label>
              <input
                type="text"
                list="condition-fields"
                className="w-full px-2 py-1.5 border rounded-md text-xs bg-background font-mono"
                placeholder="contact.leadScore"
                value={step.condition?.field || "contact.leadScore"}
                onChange={(e) =>
                  onChange({
                    ...step,
                    condition: {
                      field: e.target.value,
                      operator: step.condition?.operator || "GREATER_THAN",
                      value: step.condition?.value ?? 80,
                    },
                  })
                }
              />
              <datalist id="condition-fields">
                {CONDITION_FIELDS.map((cf) => (
                  <option key={cf.value} value={cf.value}>
                    {cf.label}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Operador Lógico</label>
              <select
                className="w-full px-2 py-1.5 border rounded-md text-xs bg-background font-medium"
                value={step.condition?.operator || "GREATER_THAN"}
                onChange={(e: any) =>
                  onChange({
                    ...step,
                    condition: {
                      field: step.condition?.field || "contact.leadScore",
                      operator: e.target.value,
                      value: step.condition?.value ?? 80,
                    },
                  })
                }
              >
                <option value="GREATER_THAN">&gt; Mayor Que</option>
                <option value="LESS_THAN">&lt; Menor Que</option>
                <option value="EQUALS">== Igual A</option>
                <option value="NOT_EQUALS">!= No Igual A</option>
                <option value="CONTAINS">Contiene Texto</option>
                <option value="IN">En Lista</option>
                <option value="IS_EMPTY">Está Vacío</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Valor Objetivo</label>
              <input
                type="text"
                className="w-full px-2 py-1.5 border rounded-md text-xs bg-background"
                placeholder="80, Colombia, etc."
                value={String(step.condition?.value ?? "")}
                onChange={(e) =>
                  onChange({
                    ...step,
                    condition: {
                      field: step.condition?.field || "contact.leadScore",
                      operator: step.condition?.operator || "GREATER_THAN",
                      value: !isNaN(Number(e.target.value)) ? Number(e.target.value) : e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
