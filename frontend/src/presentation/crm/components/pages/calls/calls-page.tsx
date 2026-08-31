"use client"

import { useState } from "react"
import { Plus, Phone, PhoneIncoming, PhoneOutgoing, Video } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { FormInput, FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCallsList, useCreateCall } from "@src/application/crm/di/hooks"

const callSchema = z.object({
  callType: z.enum(["INBOUND", "OUTBOUND", "MEETING"]),
  happenedAt: z.string().min(1, "Date is required"),
  summary: z.string().max(2000).optional(),
})

type CallFormData = z.infer<typeof callSchema>

export function CallsListPage() {
  const { tenantId, userId } = useAuth()
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CallFormData>({
    resolver: zodResolver(callSchema),
    defaultValues: { callType: "OUTBOUND", happenedAt: new Date().toISOString().slice(0, 10) },
  })

  const { data, isLoading, isError, error } = useCallsList({ tenantId: tenantId! })

  const { mutate: createCall, isPending: isCreating } = useCreateCall()

  const callTypeIcons: Record<string, React.ReactNode> = {
    INBOUND: <PhoneIncoming className="h-4 w-4 text-emerald-500" />,
    OUTBOUND: <PhoneOutgoing className="h-4 w-4 text-signal-blue" />,
    MEETING: <Video className="h-4 w-4 text-purple-500" />,
  }

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Calls"
        description="Manage your call logs"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Log Call
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((call: any) => (
            <Card key={call.id} className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iron">
                {callTypeIcons[call.callType] ?? <Phone className="h-4 w-4 text-ash" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">{call.callType}</Badge>
                  <span className="text-caption text-ash">
                    {new Date(call.happenedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-body text-paper mt-1">{call.summary ?? "No summary"}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No calls found" description="Log your first call to get started" />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Log Call">
        <form onSubmit={handleSubmit((data) => createCall(
          { tenantId: tenantId!, callType: data.callType, happenedAt: data.happenedAt, authorUserId: userId!, summary: data.summary || null },
          { onSuccess: () => { setShowCreate(false); reset() } }
        ))} className="space-y-4">
          <FormSelect
            label="Call Type"
            registration={register("callType")}
            error={errors.callType}
            required
          >
            <option value="INBOUND">Inbound</option>
            <option value="OUTBOUND">Outbound</option>
            <option value="MEETING">Meeting</option>
          </FormSelect>
          <FormInput
            label="Date"
            type="date"
            registration={register("happenedAt")}
            error={errors.happenedAt}
            required
          />
          <FormInput
            label="Summary"
            registration={register("summary")}
            error={errors.summary}
            placeholder="Call summary..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default CallsListPage
