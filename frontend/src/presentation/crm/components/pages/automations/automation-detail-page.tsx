"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Pause, Zap, Activity, Clock, ShieldCheck, MessageSquare, Mail, Smartphone, Send, CheckSquare, Globe, TrendingUp, Flame } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { ApiAutomationRepository } from "@/src/infrastructure/crm/repositories/automation/api-automation.repository"
import type { WorkflowDefinition, WorkflowExecution } from "@/src/domain/crm/automation/workflow.entity"

export function AutomationDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null)
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [wf, execList] = await Promise.all([
        ApiAutomationRepository.getWorkflow(id),
        ApiAutomationRepository.listExecutions({ workflowId: id }),
      ])
      setWorkflow(wf)
      setExecutions(execList)
    } catch (err: any) {
      setError(err?.message || "Failed to load workflow details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleToggleStatus = async () => {
    if (!workflow) return
    try {
      if (workflow.status === "ACTIVE") {
        await ApiAutomationRepository.pauseWorkflow(workflow.id)
      } else {
        await ApiAutomationRepository.activateWorkflow(workflow.id)
      }
      await fetchData()
    } catch (err: any) {
      alert(`Action failed: ${err.message}`)
    }
  }

  if (loading) return <Skeleton className="h-96" />
  if (error || !workflow) {
    return <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error || "Workflow not found"}</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/automations")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Flujos
        </Button>
      </div>

      <PageHeader
        title={workflow.name}
        description={workflow.description || "Secuencia de automatización comercial"}
        actions={
          <div className="flex gap-2">
            <Button
              variant={workflow.status === "ACTIVE" ? "outline" : "default"}
              onClick={handleToggleStatus}
            >
              {workflow.status === "ACTIVE" ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar Flujo
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Activar Flujo
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Metadata Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Estado</div>
          <div className="mt-1 font-semibold">
            <Badge variant={workflow.status === "ACTIVE" ? "default" : "outline"}>
              {workflow.status}
            </Badge>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Versión Inmutable</div>
          <div className="mt-1 font-semibold text-lg">v{workflow.version}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Evento Disparador</div>
          <div className="mt-1 font-mono text-xs text-primary truncate">{workflow.triggerEvent}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total Pasos</div>
          <div className="mt-1 font-semibold text-lg">{workflow.stepsGraph?.length ?? 0} nodos</div>
        </Card>
      </div>

      {/* Visual Sequence Pipeline */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Grafo Secuencial del Flujo
        </h3>
        <div className="space-y-3">
          {workflow.stepsGraph?.map((step, idx) => (
            <div key={step.id} className="p-3.5 bg-muted/40 rounded-lg border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {step.type === "ACTION" ? (
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                ) : step.type === "DELAY" ? (
                  <Clock className="h-5 w-5 text-amber-500" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-purple-500" />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Paso {idx + 1}: {step.type}
                  </div>
                  <div className="text-sm font-medium text-foreground">{step.name || step.action || step.type}</div>
                  {step.action && <div className="text-[11px] font-mono text-primary">Acción: {step.action}</div>}
                  {step.condition && (
                    <div className="text-[11px] font-mono text-muted-foreground">
                      Condición: {step.condition.field} {step.condition.operator} {String(step.condition.value)}
                    </div>
                  )}
                </div>
              </div>
              {step.duration && (
                <Badge variant="secondary" className="font-mono text-xs text-amber-600">
                  ⏱️ {step.duration}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
