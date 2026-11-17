import * as XLSX from 'xlsx'
import type { ReportColumn } from './report-builder.types'

export class ReportExportService {
  static exportToExcel(
    data: Record<string, any>[],
    columns: ReportColumn[],
    fileName = 'Reporte_Personalizado_NexoraCRM'
  ): void {
    const visibleCols = columns.filter((c) => c.visible)
    const headerRow = visibleCols.map((c) => c.label)

    const rows = data.map((row) =>
      visibleCols.map((c) => {
        const val = row[c.field]
        if (val === null || val === undefined) return ''
        if (c.dataType === 'date' && typeof val === 'string') {
          return new Date(val).toLocaleDateString()
        }
        return val
      })
    )

    // Calculate Totals Row for sum/avg aggregates
    const totalsRow = visibleCols.map((c, idx) => {
      if (idx === 0) return 'TOTALES / RESUMEN'
      if (c.aggregate === 'sum') {
        const sum = data.reduce((acc, row) => acc + (Number(row[c.field]) || 0), 0)
        return sum
      }
      if (c.aggregate === 'avg') {
        const count = data.filter((r) => r[c.field] !== null && r[c.field] !== undefined).length
        const sum = data.reduce((acc, row) => acc + (Number(row[c.field]) || 0), 0)
        return count > 0 ? Number((sum / count).toFixed(2)) : 0
      }
      return ''
    })

    const worksheetData = [headerRow, ...rows, totalsRow]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Auto-fit column widths
    worksheet['!cols'] = visibleCols.map((c) => ({
      wch: Math.max(c.label.length + 4, 15),
    }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  static exportToCSV(
    data: Record<string, any>[],
    columns: ReportColumn[],
    fileName = 'Reporte_Personalizado'
  ): void {
    const visibleCols = columns.filter((c) => c.visible)
    const headerLine = visibleCols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',')

    const rowLines = data.map((row) =>
      visibleCols
        .map((c) => {
          let val = row[c.field]
          if (val === null || val === undefined) val = ''
          return `"${String(val).replace(/"/g, '""')}"`
        })
        .join(',')
    )

    const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
}
