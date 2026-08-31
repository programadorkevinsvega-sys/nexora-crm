"use client"

import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { TagManager } from "@/src/presentation/crm/components/modules/tags/tag-manager"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useTagsList } from "@src/application/crm/di/hooks"

export function TagsPage() {
  const { tenantId } = useAuth()
  const tid = tenantId || "00000000-0000-0000-0000-000000000001"
  const { data, isLoading, isError, error } = useTagsList({ tenantId: tid })

  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Etiquetas & Taxonomía Comercial"
        description="Crea y clasifica tus prospectos, contactos y oportunidades de venta con etiquetas de colores."
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <TagManager tags={data?.data ?? []} />
      )}
    </div>
  )
}

export default TagsPage
