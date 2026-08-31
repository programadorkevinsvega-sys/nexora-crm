"use client"

import React, { useState } from "react"
import { Zap, Send, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { api } from "@/src/infrastructure/crm/api/api-client"
import type { WorkflowStep } from "@/src/domain/crm/automation/workflow.entity"

interface WorkflowActionInspectorProps {
  step: WorkflowStep
  onUpdate: (updated: WorkflowStep) => void
}

export function WorkflowActionInspector({ step, onUpdate }: WorkflowActionInspectorProps) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const isSlack = step.action === "SEND_SLACK"
  const isDiscord = step.action === "SEND_DISCORD"
  const isAccounting = step.action === "SYNC_ACCOUNTING"

  const handleTestDirectAction = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res: any = await api.post("/api/integrations/execute-action", {
        action: step.action,
        channel: step.config?.channel || "#general",
        message: step.config?.payload || `Prueba de acción nativa ${step.action} desde el diseñador de flujos`,
        title: step.name || "Alerta de Flujo CRM",
        amount: Number(step.config?.amount) || 1500,
        provider: step.config?.provider || "QUICKBOOKS",
        customerName: "Cliente de Prueba",
      })
      setTestResult({
        success: res?.success !== false,
        message: res?.message || "Acción ejecutada con éxito en la plataforma externa",
      })
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || `Error al disparar acción hacia ${step.action}`,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
          {isSlack || isDiscord ? <Send className="h-3.5 w-3.5" /> : isAccounting ? <TrendingUp className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
          <span>{isSlack ? "Slack Nativo" : isDiscord ? "Discord Embed" : isAccounting ? "Facturación ERP" : "Configuración de Acción"}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{step.action || "GENERIC"}</span>
      </div>

      {/* Slack Channel */}
      {isSlack && (
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Canal de Slack Destino</label>
          <input
            type="text"
            value={String(step.config?.channel || "#ventas")}
            onChange={(e) => onUpdate({ ...step, config: { ...step.config, channel: e.target.value } })}
            className="w-full p-2 border rounded-md bg-background text-xs font-mono"
            placeholder="#ventas, #alertas, #general"
          />
        </div>
      )}

      {/* Accounting Provider */}
      {isAccounting && (
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Software Contable</label>
          <select
            value={String(step.config?.provider || "QUICKBOOKS")}
            onChange={(e) => onUpdate({ ...step, config: { ...step.config, provider: e.target.value } })}
            className="w-full p-2 border rounded-md bg-background text-xs font-semibold"
          >
            <option value="QUICKBOOKS">QuickBooks Online</option>
            <option value="SIIGO">Siigo Cloud</option>
            <option value="ALEGRA">Alegra Contabilidad</option>
            <option value="FACTURAMA">Facturama CFDI</option>
            <option value="GENERIC_ERP">ERP Rest API</option>
          </select>
        </div>
      )}

      {/* Message / Payload */}
      <div>
        <label className="block text-[10px] text-muted-foreground mb-1">
          {isAccounting ? "Concepto / Descripción Factura" : "Mensaje / Notificación"}
        </label>
        <textarea
          rows={3}
          value={String(step.config?.payload || step.config?.title || "")}
          onChange={(e) => onUpdate({ ...step, config: { ...step.config, payload: e.target.value, title: e.target.value } })}
          placeholder={isAccounting ? "Factura de venta por cierre de deal comercial..." : "Escribe el mensaje o notificación..."}
          className="w-full p-2 border rounded-md bg-background text-xs"
        />
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div className={`p-2.5 rounded-lg border flex items-start gap-2 ${testResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
          {testResult.success ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
          <div className="text-[11px] leading-tight">{testResult.message}</div>
        </div>
      )}

      {/* Live Test Trigger Button */}
      {(isSlack || isDiscord || isAccounting) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTestDirectAction}
          disabled={testing}
          className="w-full text-xs h-7 border-primary/30 text-primary hover:bg-primary/10"
        >
          {testing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
          ⚡ Probar Acción Nativa en Vivo
        </Button>
      )}
    </div>
  )
}

export default WorkflowActionInspector
