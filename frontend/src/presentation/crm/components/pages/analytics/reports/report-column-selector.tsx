"use client"

import React from "react"
import { CheckSquare, Square, ChevronUp, ChevronDown } from "lucide-react"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import type { ReportColumn, AggregateFunction } from "./report-builder.types"

interface ReportColumnSelectorProps {
  columns: ReportColumn[]
  onChangeColumns: (cols: ReportColumn[]) => void
}

export function ReportColumnSelector({ columns, onChangeColumns }: ReportColumnSelectorProps) {
  const toggleVisibility = (id: string) => {
    onChangeColumns(
      columns.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    )
  }

  const moveColumn = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= columns.length) return
    const newCols = [...columns]
    const [moved] = newCols.splice(index, 1)
    newCols.splice(targetIndex, 0, moved)
    onChangeColumns(newCols)
  }

  const changeAggregate = (id: string, aggregate: AggregateFunction) => {
    onChangeColumns(
      columns.map((c) => (c.id === id ? { ...c, aggregate } : c))
    )
  }

  return (
    <div className="space-y-3 bg-card p-4 rounded-xl border border-border/80 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CheckSquare className="h-3.5 w-3.5 text-primary" /> Columnas & Métricas ({columns.filter((c) => c.visible).length}/{columns.length})
        </h4>
        <span className="text-[11px] text-muted-foreground">Reordena o activa funciones Σ</span>
      </div>

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {columns.map((col, idx) => {
          const isNumeric = col.dataType === "number" || col.dataType === "currency" || col.dataType === "percentage"

          return (
            <div
              key={col.id}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                col.visible
                  ? "bg-muted/40 border-border"
                  : "bg-background/40 border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <div
                className="flex items-center gap-2 cursor-pointer select-none flex-1 truncate"
                onClick={() => toggleVisibility(col.id)}
              >
                {col.visible ? (
                  <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="font-medium truncate">{col.label}</span>
                <Badge variant="outline" size="sm" className="text-[9px] uppercase px-1.5 py-0 font-mono">
                  {col.dataType}
                </Badge>
              </div>

              {/* Aggregation Selector for numeric columns */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {col.visible && isNumeric && (
                  <select
                    value={col.aggregate || "none"}
                    onChange={(e) => changeAggregate(col.id, e.target.value as AggregateFunction)}
                    className="h-6 px-1.5 text-[10px] bg-background border rounded font-medium text-muted-foreground"
                    title="Función de agregación para el resumen"
                  >
                    <option value="none">- Sin Σ -</option>
                    <option value="sum">Σ Suma</option>
                    <option value="avg">Avg Promedio</option>
                    <option value="min">Min Mínimo</option>
                    <option value="max">Max Máximo</option>
                  </select>
                )}

                {/* Reorder Buttons */}
                <button
                  onClick={() => moveColumn(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 rounded hover:bg-muted"
                  title="Subir columna"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => moveColumn(idx, "down")}
                  disabled={idx === columns.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 rounded hover:bg-muted"
                  title="Bajar columna"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReportColumnSelector
