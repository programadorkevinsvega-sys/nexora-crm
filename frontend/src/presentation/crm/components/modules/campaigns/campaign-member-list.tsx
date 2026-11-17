"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useContactsList } from "@src/application/crm/di/hooks"

const memberSchema = z.object({
  contactId: z.string().min(1, "Please select a contact").uuid("Invalid Contact"),
})

type MemberFormData = z.infer<typeof memberSchema>

export interface CampaignMemberListProps {
  campaignId: string
}

export function CampaignMemberList({ campaignId }: CampaignMemberListProps) {
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  })

  const { data: contactsData } = useContactsList({ tenantId: tenantId! })
  const contacts = contactsData?.data ?? []

  const { data, isLoading } = useQuery({
    queryKey: ["campaign-members", campaignId],
    queryFn: async () => {
      const { ApiCampaignRepository } = await import("@/src/infrastructure/crm/repositories/campaigns/api-campaign.repository")
      return ApiCampaignRepository.listMembers(campaignId)
    },
    enabled: !!campaignId,
  })

  const addMutation = useMutation({
    mutationFn: (formData: MemberFormData) => {
      const repoPromise = import("@/src/infrastructure/crm/repositories/campaigns/api-campaign.repository")
      return repoPromise.then(({ ApiCampaignRepository }) =>
        ApiCampaignRepository.addMember({
          tenantId: tenantId!,
          campaignId,
          contactId: formData.contactId,
        })
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-members", campaignId] })
      setShowAdd(false)
      reset()
    },
  })

  const getContactLabel = (contactId: string) => {
    const contact = contacts.find((c: any) => c.id === contactId)
    if (contact) {
      return `${contact.firstName} ${contact.lastName ?? ""}`.trim()
    }
    return contactId
  }

  const columns: ColumnDef<any>[] = [
    {
      key: "contactId",
      header: "Contact",
      render: (row) => <span className="font-medium text-paper">{getContactLabel(row.contactId)}</span>,
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "respondedAt", header: "Responded", render: (row) => row.respondedAt ? new Date(row.respondedAt).toLocaleDateString() : "—" },
  ]

  if (isLoading) return <Skeleton className="h-48" />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAdd(true)}>Add Member</Button>
      </div>

      {data && data.data.length > 0 ? (
        <DataTable columns={columns} data={data.data} />
      ) : (
        <EmptyState title="No members" description="Add contacts to this campaign" />
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Member" size="sm">
        <form onSubmit={handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
          <FormSelect
            label="Contact"
            registration={register("contactId")}
            error={errors.contactId}
            required
          >
            <option value="">Select a contact...</option>
            {contacts.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName ?? ""} {c.email ? `(${c.email})` : ""}
              </option>
            ))}
          </FormSelect>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default CampaignMemberList
