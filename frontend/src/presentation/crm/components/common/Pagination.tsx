"use client"

import { cn } from "@/src/shared/utils/cn"
import { Button } from "@/src/presentation/crm/components/ui/Button"

export interface PaginationProps {
  nextCursor?: string | null
  loading?: boolean
  onLoadMore: () => void
  className?: string
}

function Pagination({
  nextCursor,
  loading,
  onLoadMore,
  className,
}: PaginationProps) {
  if (!nextCursor) return null

  return (
    <div className={cn("flex justify-center py-6", className)}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ash border-t-transparent" />
            Loading...
          </span>
        ) : (
          "Load more"
        )}
      </Button>
    </div>
  )
}

export { Pagination }
