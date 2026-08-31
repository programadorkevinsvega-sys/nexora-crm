"use client"

import { type ReactNode } from "react"
import { cn } from "@/src/shared/utils/cn"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"

export interface ColumnDef<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
  align?: "left" | "right" | "center"
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  nextCursor?: string | null
  onLoadMore?: () => void
  loading?: boolean
  loadingMore?: boolean
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
}

function DataTable<T>({
  columns,
  data,
  nextCursor,
  onLoadMore,
  loading,
  loadingMore,
  onRowClick,
  emptyMessage = "No data found",
  className,
}: DataTableProps<T>) {
  const alignClass = (align?: string) => {
    switch (align) {
      case "right": return "text-right"
      case "center": return "text-center"
      default: return "text-left"
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-cards)] rekki-inset bg-graphite", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-steel">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-caption font-medium text-ash",
                    alignClass(col.align),
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-steel/50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-body text-ash"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={(row as Record<string, unknown>).id as string ?? rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-steel/50 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-iron/50",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-body text-paper",
                        alignClass(col.align),
                        col.className,
                      )}
                    >
                      {col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {nextCursor && onLoadMore && (
        <div className="flex justify-center p-4 border-t border-steel">
          <Button
            variant="ghost"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}

export { DataTable }
