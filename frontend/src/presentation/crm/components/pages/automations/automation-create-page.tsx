"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ArrowDown, Save, Zap, Clock, ShieldCheck, MessageSquare } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { ApiAutomationRepository } from "@/src/infrastructure/crm/repositories/automation/api-automation.repository"
import { WorkflowStepEditorCard, ACTION_TYPES } from "./automation-step-editor"
import type { WorkflowStep, StepType } from "@/src/domain/crm/automation/workflow.entity"

const TRIGGER_OPTIONS = [
  { value: "crm.contact.created", label: "Contact Created (Nuevo Contacto)" },
  { value: "crm.deal.won", label: "Deal Won (Venta Ganada)" },
  { value: "crm.deal.created", label: "Deal Created (Oportunidad Creada)" },
  { value: "crm.ticket.created", label: "Ticket Created (Ticket de Soporte)" },
  { value: "crm.quote.created", label: "Quote Created (Cotización Creada)" },
  { value: "crm.lead.score_threshold_reached", label: "Lead Reached Hot Score (Score ≥ 80 pts)" },
  { value: "crm.contract.signed", label: "Contract Signed (Contrato Firmado)" },
]

export function AutomationCreatePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [triggerEvent, setTriggerEvent] = useState(TRIGGER_OPTIONS[0].value)
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "step_1",
      name: "Enviar WhatsApp de Bienvenida",
      type: "ACTION",
      action: "SEND_WHATSAPP",
      config: { template: "welcome_template", payload: "¡Hola! Gracias por contactarnos." },
    },
    {
      id: "step_2",
      name: "Esperar 24 Horas",
      type: "DELAY",
      duration: "24h",
    },
    {
      id: "step_3",
      name: "Crear Tarea de Seguimiento Comercial",
      type: "ACTION",
      action: "CREATE_TASK",
      config: { title: "Llamar al prospecto calificado" },
    },
  ])
  const [saving, setSaving] = useState(false)

  const handleAddStep = (type: StepType, defaultAction?: string) => {
    const newId = `step_${Date.now()}`
    let newStep: WorkflowStep

    if (type === "ACTION") {
      const act = defaultAction || "SEND_WHATSAPP"
      const actInfo = ACTION_TYPES.find((a) => a.value === act)
      newStep = {
        id: newId,
        name: actInfo?.label || "Nueva Acción",
        type: "ACTION",
        action: act,
        config: { payload: "" },
      }
    } else if (type === "DELAY") {
      newStep = {
        id: newId,
        name: "Esperar 1 Hora",
        type: "DELAY",
        duration: "1h",
      }
    } else {
      newStep = {
        id: newId,
        name: "Verificar Puntuación de Lead (≥ 80 pts)",
        type: "CONDITION",
        condition: {
          field: "contact.leadScore",
          operator: "GREATER_THAN",
          value: 80,
        },
      }
    }

    setSteps([...steps, newStep])
  }

  const handleUpdateStep = (index: number, updated: WorkflowStep) => {
    const newSteps = [...steps]
    newSteps[index] = updated
    setSteps(newSteps)
  }

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, idx) => idx !== index))
  }

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length) return
    const newSteps = [...steps]
    const [moved] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, moved)
    setSteps(newSteps)
  }

  const handleSave = async (activate = false) => {
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para el flujo de automatización")
      return
    }
    if (steps.length === 0) {
      alert("Por favor agrega al menos un paso en la secuencia")
      return
    }

    try {
      setSaving(true)
      // Chain step IDs sequentially
      const chainedSteps = steps.map((s, idx) => ({
        ...s,
        nextStepId: idx < steps.length - 1 ? steps[idx + 1].id : undefined,
      }))

      const wf = await ApiAutomationRepository.createWorkflow({
        name: name.trim(),
        description: description.trim() || undefined,
        triggerEvent,
        stepsGraph: chainedSteps,
      })

      if (activate) {
        await ApiAutomationRepository.activateWorkflow(wf.id)
      }

      router.push("/automations")
    } catch (err: any) {
      alert(`Error al guardar flujo: ${err?.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Diseñador de Flujos de Automatización"
        description="Construye secuencias interactivas multicanal (WhatsApp, Email, SMS, Telegram, Webhook, Retardos y Decisiones)."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              <Zap className="h-4 w-4 mr-2" />
              Guardar y Activar
            </Button>
          </div>
        }
      />

      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold">Configuración General del Disparador</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Nombre de la Automatización *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              placeholder="e.g. Flujo de Calificación y Onboarding de Clientes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Evento Disparador (Trigger Event) *
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md text-sm bg-background font-medium"
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
            >
              {TRIGGER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Descripción del Proceso Comercial
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
            placeholder="Explica qué objetivo de ventas o soporte cumple este flujo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Card>

      {/* Visual Sequence Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Secuencia de Pasos Ejecutables ({steps.length})
          </h3>
          <span className="text-xs text-muted-foreground">Personaliza cada acción, retardo o condición</span>
        </div>

        {/* Trigger Header Block */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs uppercase font-bold text-primary">DISPARADOR INICIAL (TRIGGER)</div>
              <div className="text-sm font-semibold">{TRIGGER_OPTIONS.find((t) => t.value === triggerEvent)?.label || triggerEvent}</div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Inicia automáticamente al emitirse el evento</span>
        </div>

        {/* Steps Flow */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={step.id} className="space-y-3">
              <div className="flex justify-center">
                <ArrowDown className="h-4 w-4 text-muted-foreground animate-bounce" />
              </div>
              <WorkflowStepEditorCard
                step={step}
                index={idx}
                totalSteps={steps.length}
                onChange={(updated) => handleUpdateStep(idx, updated)}
                onRemove={() => handleRemoveStep(idx)}
                onMoveUp={() => handleMoveStep(idx, idx - 1)}
                onMoveDown={() => handleMoveStep(idx, idx + 1)}
              />
            </div>
          ))}
        </div>

        {/* Add Step Toolbars */}
        <div className="pt-4 p-4 border rounded-lg bg-muted/30 space-y-3">
          <div className="text-xs font-semibold text-center text-muted-foreground uppercase">
            + Agregar Siguiente Paso a la Secuencia
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => handleAddStep("ACTION", "SEND_WHATSAPP")}>
              <MessageSquare className="h-3.5 w-3.5 mr-1 text-emerald-500" /> + WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddStep("ACTION", "SEND_EMAIL")}>
              <Plus className="h-3.5 w-3.5 mr-1 text-blue-500" /> + Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddStep("ACTION", "SEND_SMS")}>
              <Plus className="h-3.5 w-3.5 mr-1 text-indigo-500" /> + SMS Texto
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddStep("ACTION", "SEND_TELEGRAM")}>
              <Plus className="h-3.5 w-3.5 mr-1 text-sky-500" /> + Telegram
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddStep("ACTION", "TRIGGER_WEBHOOK")}>
              <Plus className="h-3.5 w-3.5 mr-1 text-rose-500" /> + Webhook
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddStep("ACTION", "CREATE_TASK")}>
              <Plus className="h-3.5 w-3.5 mr-1 text-amber-500" /> + Tarea CRM
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddStep("DELAY")}>
              <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" /> + Espera / Retardo
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddStep("CONDITION")}>
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-purple-500" /> + Regla / Condición
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
