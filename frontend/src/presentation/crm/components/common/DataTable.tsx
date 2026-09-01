"use client"

import { type ReactNode } from "react"
import { cn } from "@/src/shared/utils/cn"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Inbox } from "lucide-react"

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
  emptyMessage = "No se encontraron registros",
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
    <div className={cn("overflow-hidden rounded-[12px] border border-border bg-card shadow-xs", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 text-[11px] font-[510] uppercase tracking-[0.06em] text-muted-foreground select-none",
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
                <tr key={i} className="animate-pulse border-b border-border">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-full text-muted-foreground/60">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-[13px] font-[400] text-muted-foreground">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={(row as Record<string, unknown>).id as string ?? rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border transition-colors duration-100",
                    onRowClick && "cursor-pointer hover:bg-muted/40",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-[13px] text-foreground",
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
        <div className="flex justify-center p-3 border-t border-border bg-muted/20">
          <Button
            variant="secondary"
            size="sm"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Cargando..." : "Cargar más"}
          </Button>
        </div>
      )}
    </div>
  )
}

export { DataTable }
