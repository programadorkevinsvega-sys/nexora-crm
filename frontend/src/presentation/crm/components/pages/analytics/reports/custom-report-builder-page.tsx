"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  FileSpreadsheet, Download, Printer, Save, RefreshCw, Layers,
  Briefcase, Users, Building2, Ticket, FileText, Sparkles, FolderOpen,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { SOURCE_COLUMNS } from "./report-columns-definition"
import { ReportColumnSelector } from "./report-column-selector"
import { ReportFiltersBar } from "./report-filters-bar"
import { ReportPivotSummary } from "./report-pivot-summary"
import { ReportBuilderTable } from "./report-builder-table"
import { ReportExportService } from "./report-export.service"
import { ApiDealRepository } from "@/src/infrastructure/crm/repositories/deals/api-deal.repository"
import { ApiContactRepository } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"
import { ApiCompanyRepository } from "@/src/infrastructure/crm/repositories/companies/api-company.repository"
import { ApiTicketRepository } from "@/src/infrastructure/crm/repositories/tickets/api-ticket.repository"
import { ApiQuoteRepository } from "@/src/infrastructure/crm/repositories/contracts/api-quote.repository"
import type { ReportDataSource, ReportColumn, SavedReportTemplate } from "./report-builder.types"

export function CustomReportBuilderPage() {
  const [dataSource, setDataSource] = useState<ReportDataSource>("deals")
  const [columns, setColumns] = useState<ReportColumn[]>(SOURCE_COLUMNS.deals)
  const [rawData, setRawData] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [savedTemplates, setSavedTemplates] = useState<SavedReportTemplate[]>([])
  const [templateName, setTemplateName] = useState("")
  const [showSaveModal, setShowSaveModal] = useState(false)

  // Switch Data Source
  const handleSelectDataSource = (source: ReportDataSource) => {
    setDataSource(source)
    setColumns(SOURCE_COLUMNS[source])
    setStatusFilter("ALL")
  }

  // Fetch Data for current source
  const loadData = async () => {
    try {
      setLoading(true)
      let items: Record<string, any>[] = []
      if (dataSource === "deals") {
        const res = await ApiDealRepository.list({}, { limit: 100 })
        items = (res as any)?.items || (res as any)?.data || []
      } else if (dataSource === "contacts") {
        const res = await ApiContactRepository.list({}, { limit: 100 })
        items = (res as any)?.items || (res as any)?.data || []
      } else if (dataSource === "companies") {
        const res = await ApiCompanyRepository.list({}, { limit: 100 })
        items = (res as any)?.items || (res as any)?.data || []
      } else if (dataSource === "tickets") {
        const res = await ApiTicketRepository.list({}, { limit: 100 })
        items = (res as any)?.items || (res as any)?.data || []
      } else if (dataSource === "quotes") {
        const res = await ApiQuoteRepository.list({}, { limit: 100 })
        items = (res as any)?.items || (res as any)?.data || []
      }
      setRawData(items)
    } catch (err) {
      console.error("Error loading report data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dataSource])

  // Extract distinct status values for filter dropdown
  const distinctStatuses = useMemo(() => {
    const statusField = dataSource === "contacts" ? "leadStatus" : "status"
    const set = new Set<string>()
    rawData.forEach((r) => { if (r[statusField]) set.add(String(r[statusField])) })
    return Array.from(set)
  }, [rawData, dataSource])

  // Filtered dataset
  const filteredData = useMemo(() => {
    return rawData.filter((row) => {
      // Status filter
      const statusField = dataSource === "contacts" ? "leadStatus" : "status"
      if (statusFilter !== "ALL" && String(row[statusField]) !== statusFilter) return false

      // Date range filter
      if (dateRange !== "ALL" && row.createdAt) {
        const rowDate = new Date(row.createdAt).getTime()
        const now = Date.now()
        const dayMs = 86400000
        if (dateRange === "TODAY" && now - rowDate > dayMs) return false
        if (dateRange === "THIS_WEEK" && now - rowDate > 7 * dayMs) return false
        if (dateRange === "THIS_MONTH" && now - rowDate > 30 * dayMs) return false
        if (dateRange === "THIS_QUARTER" && now - rowDate > 90 * dayMs) return false
        if (dateRange === "THIS_YEAR" && now - rowDate > 365 * dayMs) return false
      }

      // Search query across all visible columns
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches = columns.some((c) => {
          const val = row[c.field]
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        })
        if (!matches) return false
      }

      return true
    })
  }, [rawData, columns, statusFilter, dateRange, searchQuery, dataSource])

  // Export handlers
  const handleExportExcel = () => {
    ReportExportService.exportToExcel(filteredData, columns, `Reporte_${dataSource.toUpperCase()}`)
  }

  const handleExportCSV = () => {
    ReportExportService.exportToCSV(filteredData, columns, `Reporte_${dataSource.toUpperCase()}`)
  }

  // Template saving
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return
    const newTpl: SavedReportTemplate = {
      id: `tpl_${Date.now()}`,
      name: templateName.trim(),
      dataSource,
      selectedColumnIds: columns.filter((c) => c.visible).map((c) => c.id),
      filters: [],
      createdAt: new Date().toISOString(),
    }
    setSavedTemplates([newTpl, ...savedTemplates])
    setTemplateName("")
    setShowSaveModal(false)
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Creador de Reportes a Medida"
        description="Genera tablas dinámicas personalizadas, reordena columnas, aplica agregaciones (Σ Suma / Promedio) y exporta a Excel en tiempo real."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
              <Printer className="h-4 w-4 mr-1.5" /> Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
              <FileText className="h-4 w-4 mr-1.5 text-blue-400" /> Exportar CSV
            </Button>
            <Button variant="default" size="sm" onClick={handleExportExcel} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Exportar a Excel (.xlsx)
            </Button>
          </div>
        }
      />

      {/* Data Source Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-card rounded-xl border border-border/80 shadow-sm">
        {[
          { id: "deals", label: "Oportunidades (Deals)", icon: Briefcase },
          { id: "contacts", label: "Contactos & Clientes", icon: Users },
          { id: "companies", label: "Empresas (B2B)", icon: Building2 },
          { id: "tickets", label: "Tickets de Soporte", icon: Ticket },
          { id: "quotes", label: "Cotizaciones (Quotes)", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = dataSource === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectDataSource(tab.id as ReportDataSource)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Column Manager + Live Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ReportColumnSelector columns={columns} onChangeColumns={setColumns} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <ReportFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statuses={distinctStatuses}
            totalRecords={rawData.length}
            filteredRecords={filteredData.length}
          />
          <ReportPivotSummary data={filteredData} columns={columns} />
        </div>
      </div>

      {/* Live Preview Table */}
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <ReportBuilderTable data={filteredData} columns={columns} />
      )}
    </div>
  )
}

export default CustomReportBuilderPage
