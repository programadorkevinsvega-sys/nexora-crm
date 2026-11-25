"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Select } from "@/src/presentation/crm/components/ui/Select"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePipelinesList, usePipelineBoard, useCreateDeal } from "@src/application/crm/di/hooks"
import type { DealCreateInput } from "@/src/domain/crm/deals/deal.entity"

export function CreateDealPage() {
  const router = useRouter()
  const { tenantId } = useAuth()

  const [name, setName] = useState("")
  const [pipelineId, setPipelineId] = useState("")
  const [stageId, setStageId] = useState("")
  const [value, setValue] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [closeDate, setCloseDate] = useState("")

  const { data: pipelinesData, isError, error } = usePipelinesList({ tenantId: tenantId ?? undefined })
  const { data: pipelineBoard, isLoading: stagesLoading } = usePipelineBoard(pipelineId)
  const selectedPipeline = pipelinesData?.data.find((pipeline) => pipeline.id === pipelineId)
  const selectedStage = pipelineBoard?.stages.find((stage) => stage.id === stageId)

  const { mutate: createDeal, isPending } = useCreateDeal()

  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Crear Oportunidad (Deal)"
        breadcrumb={[
          { label: "Pipelines", href: "/pipelines" },
          { label: "Nuevo Deal" },
        ]}
      />

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Nombre de la Oportunidad *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Renovación Licencias SaaS" />
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Pipeline *</label>
          <Select value={pipelineId} onChange={(e) => { setPipelineId(e.target.value); setStageId("") }}>
            <option value="">Seleccionar Pipeline</option>
            {pipelinesData?.data.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>
            ))}
          </Select>
        </div>

        {selectedPipeline && (
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Etapa Comercial *</label>
            <Select value={stageId} onChange={(e) => setStageId(e.target.value)}>
              <option value="">Seleccionar Etapa</option>
              {pipelineBoard?.stages.map((stage) => (
                <option key={stage.id} value={stage.id}>{stage.name} ({stage.probabilityPercent ?? 0}%)</option>
              ))}
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Monto</label>
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Moneda</label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="COP">COP ($)</option>
              <option value="MXN">MXN ($)</option>
              <option value="EUR">EUR (€)</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Fecha Estimada Cierre</label>
          <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          <Button onClick={() => {
            if (!tenantId || !selectedStage) return
            const parsedValue = value.trim() ? Number(value) : null
            if (parsedValue !== null && (!Number.isFinite(parsedValue) || parsedValue < 0)) return
            const input: DealCreateInput = {
              tenantId,
              pipelineId,
              stageId,
              name: name.trim(),
              value: parsedValue,
              currency,
              probability: selectedStage.probabilityPercent,
              closeDate: closeDate || null,
            }
            createDeal(input, { onSuccess: () => router.push(`/pipelines/${pipelineId}`) })
          }} disabled={!name.trim() || !pipelineId || !stageId || !tenantId || isPending || stagesLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white">
            {isPending ? "Guardando..." : "Crear Oportunidad"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default CreateDealPage
