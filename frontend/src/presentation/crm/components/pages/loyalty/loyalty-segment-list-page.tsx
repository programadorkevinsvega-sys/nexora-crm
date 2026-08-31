"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { ErrorState } from "@/src/presentation/components/error-state"
import { FormInput } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useSegmentsList, useCreateSegment } from "@src/application/crm/di/hooks"

const segmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
})

type SegmentFormData = z.infer<typeof segmentSchema>

export function SegmentListPage() {
  const { tenantId } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SegmentFormData>({
    resolver: zodResolver(segmentSchema),
  })

  const { data, isLoading, isError, error } = useSegmentsList({ tenantId: tenantId! })

  const { mutate: createSegment, isPending } = useCreateSegment()

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customer Segments"
        description="Manage loyalty segments"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Add Segment
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []).map((segment: any) => (
            <Card key={segment.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-sans font-semibold text-paper">{segment.name}</h3>
                <Badge variant={segment.isDynamic ? "info" : "default"} size="sm">
                  {segment.isDynamic ? "Dynamic" : "Static"}
                </Badge>
              </div>
              <p className="text-caption text-ash">{segment.description ?? "No description"}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No segments found" description="Create your first customer segment to get started" />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Segment">
        <form onSubmit={handleSubmit((data) => createSegment(
          { tenantId: tenantId!, name: data.name, description: data.description || null },
          { onSuccess: () => { setShowCreate(false); reset() } }
        ))} className="space-y-4">
          <FormInput
            label="Name"
            registration={register("name")}
            error={errors.name}
            required
            placeholder="Segment name"
          />
          <FormInput
            label="Description"
            registration={register("description")}
            error={errors.description}
            placeholder="Segment description"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default SegmentListPage
