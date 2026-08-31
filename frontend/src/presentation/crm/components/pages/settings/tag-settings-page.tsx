"use client"

import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { TagManager } from "@/src/presentation/crm/components/modules/tags/tag-manager"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useTagsList } from "@src/application/crm/di/hooks"

export function TagsPage() {
  const { tenantId } = useAuth()

  const { data, isLoading, isError, error } = useTagsList({ tenantId: tenantId! })

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader title="Tags" description="Manage your tags" />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <TagManager tags={data.data} />
      ) : (
        <EmptyState title="No tags found" description="Create your first tag to get started" />
      )}
    </div>
  )
}
export default TagsPage
