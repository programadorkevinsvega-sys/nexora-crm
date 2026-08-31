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
import { useCompaniesList, useCreateContract } from "@src/application/crm/di/hooks"
import type { ContractCreateInput } from "@/src/domain/crm/contracts/contract.entity"

export function CreateContractPage() {
  const router = useRouter()
  const { tenantId, userId } = useAuth()

  const [name, setName] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [status, setStatus] = useState<ContractCreateInput["status"]>("DRAFT")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [mrrValue, setMrrValue] = useState("")
  const [autoRenew, setAutoRenew] = useState(false)

  const { data: companiesData, isError, error } = useCompaniesList({ tenantId: tenantId! })

  const { mutate: createContract, isPending } = useCreateContract()

  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Create Contract"
        breadcrumb={[
          { label: "Contracts", href: "/crm/contracts" },
          { label: "Create Contract" },
        ]}
      />

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Contract Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contract name" />
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Company *</label>
          <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">Select company</option>
            {companiesData?.data.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
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
          <Button onClick={() => createContract(
                { tenantId: tenantId!, companyId, name, status, startDate, ownerUserId: userId!, endDate: endDate || null, mrrValue: mrrValue ? Number(mrrValue) : null, autoRenew },
                { onSuccess: () => router.push("/crm/contracts") }
              )} disabled={!name || !companyId || !startDate || isPending}>
            {isPending ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default CreateContractPage
