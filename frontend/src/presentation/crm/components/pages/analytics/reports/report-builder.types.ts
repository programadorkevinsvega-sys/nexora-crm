export type ReportDataSource = 'deals' | 'contacts' | 'companies' | 'tickets' | 'quotes'

export type ColumnDataType = 'text' | 'number' | 'currency' | 'date' | 'badge' | 'percentage'

export type AggregateFunction = 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max'

export interface ReportColumn {
  id: string
  label: string
  field: string
  dataType: ColumnDataType
  visible: boolean
  sortable?: boolean
  aggregate?: AggregateFunction
  width?: number
}

export interface ReportFilter {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in'
  value: string | number | boolean | string[]
}

export interface SavedReportTemplate {
  id: string
  name: string
  description?: string
  dataSource: ReportDataSource
  selectedColumnIds: string[]
  groupByField?: string
  filters: ReportFilter[]
  createdAt: string
}
