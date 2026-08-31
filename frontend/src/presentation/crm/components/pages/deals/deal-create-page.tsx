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
import { usePipelinesList, useCreateDeal } from "@src/application/crm/di/hooks"

export function CreateDealPage() {
  const router = useRouter()
  const { tenantId } = useAuth()

  const [name, setName] = useState("")
  const [pipelineId, setPipelineId] = useState("")
  const [stageId, setStageId] = useState("")
  const [value, setValue] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [probability, setProbability] = useState("")
  const [closeDate, setCloseDate] = useState("")

  const { data: pipelinesData, isError, error } = usePipelinesList({ tenantId: tenantId! })

  const selectedPipeline = pipelinesData?.data.find((p: any) => p.id === pipelineId)

  const { mutate: createDeal, isPending } = useCreateDeal()

  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Create Deal"
        breadcrumb={[
          { label: "Pipelines", href: "/crm/pipelines" },
          { label: "Create Deal" },
        ]}
      />

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Deal Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter deal name" />
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Pipeline *</label>
          <Select value={pipelineId} onChange={(e) => { setPipelineId(e.target.value); setStageId("") }}>
            <option value="">Select pipeline</option>
            {pipelinesData?.data.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>

        {selectedPipeline && (
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Stage *</label>
            <Select value={stageId} onChange={(e) => setStageId(e.target.value)}>
              <option value="">Select stage</option>
              {selectedPipeline.stages.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Value</label>
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Currency</label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="MXN">MXN</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Probability (%)</label>
            <Input type="number" value={probability} onChange={(e) => setProbability(e.target.value)} placeholder="50" min={0} max={100} />
          </div>
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Close Date</label>
            <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => createDeal(
                { tenantId: tenantId!, pipelineId, stageId, name, value: value ? Number(value) : null, currency, probability: probability ? Number(probability) : null, closeDate: closeDate || null },
                { onSuccess: () => router.push(`/crm/pipelines/${pipelineId}`) }
              )} disabled={!name || !pipelineId || !stageId || isPending}>
            {isPending ? "Creating..." : "Create Deal"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default CreateDealPage
