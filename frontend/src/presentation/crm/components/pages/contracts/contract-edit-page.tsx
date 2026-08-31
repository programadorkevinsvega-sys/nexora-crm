"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Select } from "@/src/presentation/crm/components/ui/Select"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useContract, useUpdateContract } from "@src/application/crm/di/hooks"
import type { ContractUpdateInput } from "@/src/domain/crm/contracts/contract.entity"

export function EditContractPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const id = params.id as string

  const { data: contract, isLoading, isError, error } = useContract(id)

  const [name, setName] = useState("")
  const [status, setStatus] = useState<ContractUpdateInput["status"]>("DRAFT")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [mrrValue, setMrrValue] = useState("")
  const [autoRenew, setAutoRenew] = useState(false)

  useEffect(() => {
    if (contract) {
      setName(contract.name)
      setStatus(contract.status)
      setStartDate(contract.startDate)
      setEndDate(contract.endDate ?? "")
      setMrrValue(contract.mrrValue != null ? String(contract.mrrValue) : "")
      setAutoRenew(contract.autoRenew)
    }
  }, [contract])

  const { mutate: updateContract, isPending } = useUpdateContract()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!contract) return <div className="text-body text-ash">Contract not found</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Edit Contract"
        breadcrumb={[
          { label: "Contracts", href: "/crm/contracts" },
          { label: contract.name, href: `/crm/contracts/${id}` },
          { label: "Edit" },
        ]}
      />

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Contract Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contract name" />
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Start Date *</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">MRR Value ($)</label>
          <Input type="number" value={mrrValue} onChange={(e) => setMrrValue(e.target.value)} placeholder="0.00" />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoRenew"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
            className="rounded border-steel bg-graphite text-signal-blue"
          />
          <label htmlFor="autoRenew" className="text-body text-paper">Auto Renew</label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => updateContract(
                { id, data: { name, status, startDate, endDate: endDate || null, mrrValue: mrrValue ? Number(mrrValue) : null, autoRenew } },
                { onSuccess: () => router.push(`/crm/contracts/${id}`) }
              )} disabled={!name || isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default EditContractPage
