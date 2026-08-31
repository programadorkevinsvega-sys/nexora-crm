"use client"

import React from "react"
import { Search, Calendar, Filter, X } from "lucide-react"

interface ReportFiltersBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  dateRange: string
  onDateRangeChange: (r: string) => void
  statusFilter: string
  onStatusFilterChange: (s: string) => void
  statuses: string[]
  totalRecords: number
  filteredRecords: number
}

export function ReportFiltersBar({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  statuses,
  totalRecords,
  filteredRecords,
}: ReportFiltersBarProps) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filtrar por texto en cualquier columna..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date Presets */}
        <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2 py-1 text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="bg-transparent text-xs font-medium focus:outline-none text-foreground"
          >
            <option value="ALL">Todo el Historial</option>
            <option value="TODAY">Hoy</option>
            <option value="THIS_WEEK">Esta Semana</option>
            <option value="THIS_MONTH">Este Mes</option>
            <option value="THIS_QUARTER">Este Trimestre (Q)</option>
            <option value="THIS_YEAR">Este Año</option>
          </select>
        </div>

        {/* Status Dropdown Filter */}
        {statuses.length > 0 && (
          <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2 py-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none text-foreground"
            >
              <option value="ALL">Todos los Estados</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Record Counter */}
      <div className="text-xs font-mono text-muted-foreground">
        Mostrando <span className="text-foreground font-bold">{filteredRecords}</span> de {totalRecords} registros
      </div>
    </div>
  )
}

export default ReportFiltersBar
