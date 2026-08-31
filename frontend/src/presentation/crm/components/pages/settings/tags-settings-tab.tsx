'use client'

import { TagManager } from '@/src/presentation/crm/components/modules/tags/tag-manager'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'
import { ErrorState } from '@/src/presentation/components/error-state'
import { EmptyState } from '@/src/presentation/crm/components/common/EmptyState'
import { useAuth } from '@/src/presentation/hooks/use-auth'
import { useTagsList } from '@src/application/crm/di/hooks'
import { Tag } from 'lucide-react'

export function TagsSettingsTab() {
  const { tenantId } = useAuth()
  const { data, isLoading, isError, error } = useTagsList({ tenantId: tenantId || '00000000-0000-0000-0000-000000000001' })

  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <div className="border-b border-steel pb-3">
        <h2 className="text-lg font-semibold text-paper flex items-center gap-2">
          <Tag className="h-4 w-4 text-signal-blue" />
          Etiquetas & Taxonomía Comercial
        </h2>
        <p className="text-xs text-ash">
          Clasifica tus contactos, tratos y empresas con etiquetas de colores personalizadas.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : data && data.data.length > 0 ? (
        <TagManager tags={data.data} />
      ) : (
        <EmptyState title="No hay etiquetas creadas" description="Crea tu primera etiqueta para clasificar prospectos y clientes." />
      )}
    </div>
  )
}
