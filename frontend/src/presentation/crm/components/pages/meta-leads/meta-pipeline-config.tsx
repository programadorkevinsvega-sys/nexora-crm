"use client"

import React, { useState, useEffect } from "react"
import { Kanban, Sparkles, Check, Save } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { usePipelinesList, useMetaUpdateConfig } from "@/src/application/crm/di/hooks"
import type { MetaIntegration } from "@crm/contracts"

interface MetaPipelineConfigProps {
  integration: MetaIntegration
}

export function MetaPipelineConfig({ integration }: MetaPipelineConfigProps) {
  const { data: pipelinesResult } = usePipelinesList()
  const pipelinesList: any[] = (pipelinesResult as any)?.data || (Array.isArray(pipelinesResult) ? pipelinesResult : [])
  const { mutate: updateConfig, isPending } = useMetaUpdateConfig()

  const [autoCreateDeal, setAutoCreateDeal] = useState(integration.autoCreateDeal ?? true)
  const [selectedPipelineId, setSelectedPipelineId] = useState(integration.targetPipelineId || "")
  const [selectedStageId, setSelectedStageId] = useState(integration.targetStageId || "")

  useEffect(() => {
    if (pipelinesList.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelinesList[0].id)
    }
  }, [pipelinesList, selectedPipelineId])

  const selectedPipeline = pipelinesList.find((p) => p.id === selectedPipelineId)
  const stages = selectedPipeline?.stages || []

  const handleSave = () => {
    updateConfig({
      autoCreateDeal,
      targetPipelineId: selectedPipelineId || undefined,
      targetStageId: selectedStageId || undefined,
    })
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg space-y-4">
      <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-3">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Kanban className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-100">Enrutamiento Automático de Leads a Pipelines</h4>
          <p className="text-xs text-zinc-400">
            Crea oportunidades comerciales (Deals) automáticamente al recibir un lead de Facebook
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoCreateDeal}
            onChange={(e) => setAutoCreateDeal(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
          />
          <span className="font-medium text-zinc-200">
            Crear Deal automáticamente en el Pipeline de Ventas al entrar un Lead de Meta
          </span>
        </label>

        {autoCreateDeal && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Pipeline de Destino</label>
              <select
                value={selectedPipelineId}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none text-xs"
              >
                {pipelinesList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Etapa Inicial</label>
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-500 focus:outline-none text-xs"
              >
                <option value="">Primera etapa del pipeline (Por defecto)</option>
                {stages.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isPending} size="sm" className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs">
            <Save className="h-3.5 w-3.5" />
            {isPending ? "Guardando..." : "Guardar Enrutamiento"}
          </Button>
        </div>
      </div>
    </div>
  )
}
