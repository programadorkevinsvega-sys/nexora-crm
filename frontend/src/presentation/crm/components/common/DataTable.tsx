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
    <div className={cn("overflow-hidden rounded-xl border border-white/[0.08] bg-[#0f141f]/80 backdrop-blur-md shadow-xl shadow-black/20", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none",
                    alignClass(col.align),
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {loading && data.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full bg-white/[0.05]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-full bg-white/[0.04] text-slate-500">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={(row as Record<string, unknown>).id as string ?? rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-all duration-150 group",
                    onRowClick && "cursor-pointer hover:bg-blue-500/[0.06]",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 text-xs text-slate-200 group-hover:text-white transition-colors",
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
        <div className="flex justify-center p-3.5 border-t border-white/[0.08] bg-white/[0.01]">
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
