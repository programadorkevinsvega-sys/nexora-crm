"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Zap, Play, Pause, ArrowRight, Activity, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiAutomationRepository } from "@/src/infrastructure/crm/repositories/automation/api-automation.repository"
import type { WorkflowDefinition, WorkflowExecution } from "@/src/domain/crm/automation/workflow.entity"

export function AutomationListPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [wfList, execList] = await Promise.all([
        ApiAutomationRepository.listWorkflows(),
        ApiAutomationRepository.listExecutions(),
      ])
      setWorkflows(wfList)
      setExecutions(execList)
    } catch (err: any) {
      setError(err?.message || "Failed to load automations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleStatus = async (wf: WorkflowDefinition) => {
    try {
      if (wf.status === "ACTIVE") {
        await ApiAutomationRepository.pauseWorkflow(wf.id)
      } else {
        await ApiAutomationRepository.activateWorkflow(wf.id)
      }
      await fetchData()
    } catch (err: any) {
      alert(`Action failed: ${err.message}`)
    }
  }

  const handleTestTrigger = async (wf: WorkflowDefinition) => {
    try {
      const res = await ApiAutomationRepository.triggerEvent({
        eventName: wf.triggerEvent,
        entityType: "contact",
        entityId: "00000000-0000-0000-0000-000000000001",
        payload: {
          test: true,
          leadScore: 90,
          country: "Colombia",
        },
      })
      alert(`Test event triggered! Executions instantiated: ${res.triggeredCount}`)
      await fetchData()
    } catch (err: any) {
      alert(`Trigger failed: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automations & Workflows"
        description="Workflow Automation Engine with triggers, conditions, delays, and background event execution"
        actions={
          <Link href="/automations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Workflows List */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Active Workflows ({workflows.length})
            </h3>
            {workflows.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Zap className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No workflows configured yet. Create your first automated sequence!</p>
                <Link href="/automations/new" className="inline-block mt-4">
                  <Button variant="outline">Create Workflow</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.map((wf) => (
                  <Card key={wf.id} className="p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            wf.status === "ACTIVE"
                              ? "success"
                              : wf.status === "PAUSED"
                              ? "warning"
                              : "default"
                          }
                        >
                          {wf.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">v{wf.version}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{wf.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {wf.description || "No description provided."}
                        </p>
                      </div>
                      <div className="text-xs bg-muted p-2 rounded flex flex-col gap-1">
                        <span className="font-medium text-foreground">Trigger:</span>
                        <code className="text-primary font-mono text-[11px]">{wf.triggerEvent}</code>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Steps: <span className="font-semibold text-foreground">{Array.isArray(wf.stepsGraph) ? wf.stepsGraph.length : 0}</span> nodes
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t gap-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(wf)}
                          title={wf.status === "ACTIVE" ? "Pause Workflow" : "Activate Workflow"}
                        >
                          {wf.status === "ACTIVE" ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5 text-primary" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTestTrigger(wf)}
                          title="Simulate Event Trigger"
                        >
                          <Activity className="h-3.5 w-3.5" />
                          Test
                        </Button>
                      </div>
                      <Link href={`/automations/${wf.id}`}>
                        <Button size="sm" variant="ghost">
                          View <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Executions History */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Executions Runtime
            </h3>
            {executions.length === 0 ? (
              <Card className="p-6 text-center text-xs text-muted-foreground">
                No execution runs recorded yet. Trigger an event to see live runtime execution history.
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b font-medium text-muted-foreground">
                      <tr>
                        <th className="p-3">Execution ID</th>
                        <th className="p-3">Entity Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Current Step</th>
                        <th className="p-3">Started At</th>
                        <th className="p-3">Completed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {executions.map((exec) => (
                        <tr key={exec.id} className="hover:bg-muted/30">
                          <td className="p-3 font-mono">{exec.id.slice(0, 8)}...</td>
                          <td className="p-3 uppercase font-medium">{exec.entityType}</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                exec.status === "COMPLETED"
                                  ? "success"
                                  : exec.status === "RUNNING"
                                  ? "info"
                                  : exec.status === "WAITING_DELAY"
                                  ? "warning"
                                  : "danger"
                              }
                            >
                              {exec.status}
                            </Badge>
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">{exec.currentStepId}</td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(exec.startedAt).toLocaleTimeString()}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {exec.completedAt ? new Date(exec.completedAt).toLocaleTimeString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
