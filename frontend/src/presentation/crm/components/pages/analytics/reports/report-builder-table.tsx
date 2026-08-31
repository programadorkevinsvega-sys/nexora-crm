"use client"

import React, { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import type { ReportColumn } from "./report-builder.types"

interface ReportBuilderTableProps {
  data: Record<string, any>[]
  columns: ReportColumn[]
}

export function ReportBuilderTable({ data, columns }: ReportBuilderTableProps) {
  const visibleCols = columns.filter((c) => c.visible)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState<boolean>(true)
  const [pageSize, setPageSize] = useState<number>(25)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  // Sorted data
  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0
    const valA = a[sortField]
    const valB = b[sortField]
    if (valA === valB) return 0
    if (valA === null || valA === undefined) return 1
    if (valB === null || valB === undefined) return -1
    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA))
  })

  // Paginated data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const renderCell = (col: ReportColumn, value: any) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground/50 italic">—</span>
    }
    switch (col.dataType) {
      case "currency":
        return <span className="font-mono font-medium text-emerald-400">${Number(value).toLocaleString()}</span>
      case "percentage":
        return <span className="font-mono">{value}%</span>
      case "number":
        return <span className="font-mono">{Number(value).toLocaleString()}</span>
      case "date":
        return <span className="text-muted-foreground">{new Date(value).toLocaleDateString()}</span>
      case "badge":
        return (
          <Badge
            variant={
              ["WON", "ACTIVE", "COMPLETED", "RESOLVED", "ACCEPTED", "HOT", "QUALIFIED"].includes(String(value).toUpperCase())
                ? "success"
                : ["LOST", "CLOSED", "REJECTED", "SPAM", "COLD"].includes(String(value).toUpperCase())
                ? "danger"
                : "default"
            }
            size="sm"
          >
            {String(value)}
          </Badge>
        )
      default:
        return <span className="truncate max-w-xs">{String(value)}</span>
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border/80 shadow-md overflow-hidden flex flex-col">
      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted/60 border-b border-border text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-3 px-4 w-12 text-center">#</th>
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  onClick={() => col.sortable && handleSort(col.field)}
                  className={`py-3 px-4 select-none ${col.sortable ? "cursor-pointer hover:text-foreground" : ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && (
                      sortField === col.field ? (
                        sortAsc ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 1} className="py-12 text-center text-muted-foreground">
                  No se encontraron registros con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 text-center font-mono text-muted-foreground/60">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  {visibleCols.map((col) => (
                    <td key={col.id} className="py-2.5 px-4">
                      {renderCell(col, row[col.field])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {/* Totals Summary Footer */}
          {sortedData.length > 0 && (
            <tfoot>
              <tr className="bg-muted/80 border-t-2 border-border/80 font-bold text-foreground">
                <td className="py-3 px-4 text-center font-mono uppercase text-[10px]">Σ</td>
                {visibleCols.map((col, idx) => {
                  if (idx === 0) return <td key={col.id} className="py-3 px-4 uppercase text-xs">TOTALES ({sortedData.length})</td>
                  if (col.aggregate === "sum") {
                    const sum = sortedData.reduce((acc, r) => acc + (Number(r[col.field]) || 0), 0)
                    return (
                      <td key={col.id} className="py-3 px-4 font-mono text-emerald-400">
                        {col.dataType === "currency" ? `$${sum.toLocaleString()}` : sum.toLocaleString()}
                      </td>
                    )
                  }
                  if (col.aggregate === "avg") {
                    const valid = sortedData.filter((r) => r[col.field] !== null && r[col.field] !== undefined)
                    const sum = valid.reduce((acc, r) => acc + (Number(r[col.field]) || 0), 0)
                    const avg = valid.length > 0 ? (sum / valid.length).toFixed(1) : 0
                    return (
                      <td key={col.id} className="py-3 px-4 font-mono text-cyan-400">
                        Avg: {col.dataType === "currency" ? `$${avg}` : `${avg}%`}
                      </td>
                    )
                  }
                  return <td key={col.id} className="py-3 px-4 text-muted-foreground/40">—</td>
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground bg-card">
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
            className="bg-background border rounded px-2 py-1 text-xs"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 border rounded hover:bg-muted disabled:opacity-30"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 border rounded hover:bg-muted disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportBuilderTable
