"use client"

import React from "react"
import { DollarSign, Percent, Layers, Calculator } from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import type { ReportColumn } from "./report-builder.types"

interface ReportPivotSummaryProps {
  data: Record<string, any>[]
  columns: ReportColumn[]
}

export function ReportPivotSummary({ data, columns }: ReportPivotSummaryProps) {
  const aggregatedCols = columns.filter((c) => c.visible && c.aggregate && c.aggregate !== "none")

  if (aggregatedCols.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Count Card */}
      <Card className="p-3.5 bg-card/90 border border-border/80 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground uppercase">Total Registros</div>
          <div className="text-lg font-bold text-foreground font-mono">{data.length}</div>
        </div>
      </Card>

      {/* Dynamic Aggregate Cards */}
      {aggregatedCols.map((col) => {
        let result: number | string = 0
        const numericValues = data
          .map((r) => Number(r[col.field]))
          .filter((v) => !isNaN(v) && v !== null)

        if (col.aggregate === "sum") {
          result = numericValues.reduce((acc, v) => acc + v, 0)
        } else if (col.aggregate === "avg") {
          result = numericValues.length > 0
            ? (numericValues.reduce((acc, v) => acc + v, 0) / numericValues.length).toFixed(1)
            : 0
        } else if (col.aggregate === "min") {
          result = numericValues.length > 0 ? Math.min(...numericValues) : 0
        } else if (col.aggregate === "max") {
          result = numericValues.length > 0 ? Math.max(...numericValues) : 0
        } else if (col.aggregate === "count") {
          result = numericValues.length
        }

        const formattedResult =
          col.dataType === "currency"
            ? `$${Number(result).toLocaleString()}`
            : col.dataType === "percentage"
            ? `${result}%`
            : Number(result).toLocaleString()

        return (
          <Card key={col.id} className="p-3.5 bg-card/90 border border-border/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              {col.dataType === "currency" ? (
                <DollarSign className="h-5 w-5" />
              ) : col.dataType === "percentage" ? (
                <Percent className="h-5 w-5" />
              ) : (
                <Calculator className="h-5 w-5" />
              )}
            </div>
            <div className="truncate">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase truncate">
                {(col.aggregate || "TOTAL").toUpperCase()} • {col.label}
              </div>
              <div className="text-lg font-bold text-foreground font-mono truncate">{formattedResult}</div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default ReportPivotSummary
