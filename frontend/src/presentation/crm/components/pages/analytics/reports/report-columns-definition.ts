import type { ReportColumn, ReportDataSource } from './report-builder.types'

export const SOURCE_COLUMNS: Record<ReportDataSource, ReportColumn[]> = {
  deals: [
    { id: 'deal_name', label: 'Nombre del Trato', field: 'name', dataType: 'text', visible: true, sortable: true },
    { id: 'deal_amount', label: 'Monto ($)', field: 'amount', dataType: 'currency', visible: true, sortable: true, aggregate: 'sum' },
    { id: 'deal_status', label: 'Estado', field: 'status', dataType: 'badge', visible: true, sortable: true },
    { id: 'deal_close', label: 'Fecha Cierre Prevista', field: 'expectedCloseDate', dataType: 'date', visible: true, sortable: true },
    { id: 'deal_stage', label: 'Etapa (Stage ID)', field: 'stageId', dataType: 'text', visible: false, sortable: true },
    { id: 'deal_assigned', label: 'Asignado (User ID)', field: 'assignedUserId', dataType: 'text', visible: false, sortable: true },
    { id: 'deal_created', label: 'Fecha Creación', field: 'createdAt', dataType: 'date', visible: true, sortable: true },
  ],
  contacts: [
    { id: 'c_name', label: 'Nombre Contacto', field: 'fullName', dataType: 'text', visible: true, sortable: true },
    { id: 'c_email', label: 'Email', field: 'email', dataType: 'text', visible: true, sortable: true },
    { id: 'c_phone', label: 'Teléfono', field: 'phone', dataType: 'text', visible: true, sortable: true },
    { id: 'c_status', label: 'Estado Lead', field: 'leadStatus', dataType: 'badge', visible: true, sortable: true },
    { id: 'c_source', label: 'Fuente', field: 'leadSource', dataType: 'text', visible: true, sortable: true },
    { id: 'c_city', label: 'Ciudad', field: 'city', dataType: 'text', visible: false, sortable: true },
    { id: 'c_points', label: 'Puntos Loyalty', field: 'loyaltyPoints', dataType: 'number', visible: true, sortable: true, aggregate: 'sum' },
    { id: 'c_created', label: 'Registrado el', field: 'createdAt', dataType: 'date', visible: false, sortable: true },
  ],
  companies: [
    { id: 'comp_name', label: 'Empresa', field: 'name', dataType: 'text', visible: true, sortable: true },
    { id: 'comp_industry', label: 'Industria', field: 'industry', dataType: 'text', visible: true, sortable: true },
    { id: 'comp_employees', label: 'N° Empleados', field: 'numberOfEmployees', dataType: 'number', visible: true, sortable: true, aggregate: 'sum' },
    { id: 'comp_revenue', label: 'Ingresos Anuales', field: 'annualRevenue', dataType: 'currency', visible: true, sortable: true, aggregate: 'sum' },
    { id: 'comp_website', label: 'Sitio Web', field: 'website', dataType: 'text', visible: false, sortable: false },
    { id: 'comp_created', label: 'Fecha Registro', field: 'createdAt', dataType: 'date', visible: false, sortable: true },
  ],
  tickets: [
    { id: 't_id', label: 'ID Ticket', field: 'id', dataType: 'text', visible: false, sortable: true },
    { id: 't_subject', label: 'Asunto / Problema', field: 'subject', dataType: 'text', visible: true, sortable: true },
    { id: 't_status', label: 'Estado', field: 'status', dataType: 'badge', visible: true, sortable: true },
    { id: 't_priority', label: 'Prioridad', field: 'priority', dataType: 'badge', visible: true, sortable: true },
    { id: 't_created', label: 'Fecha Creación', field: 'createdAt', dataType: 'date', visible: true, sortable: true },
  ],
  quotes: [
    { id: 'q_num', label: 'N° Cotización', field: 'quoteNumber', dataType: 'text', visible: true, sortable: true },
    { id: 'q_status', label: 'Estado', field: 'status', dataType: 'badge', visible: true, sortable: true },
    { id: 'q_subtotal', label: 'Subtotal', field: 'subtotal', dataType: 'currency', visible: false, sortable: true, aggregate: 'sum' },
    { id: 'q_tax', label: 'Impuestos', field: 'taxTotal', dataType: 'currency', visible: false, sortable: true, aggregate: 'sum' },
    { id: 'q_total', label: 'Monto Total (Grand Total)', field: 'grandTotal', dataType: 'currency', visible: true, sortable: true, aggregate: 'sum' },
    { id: 'q_valid', label: 'Válido Hasta', field: 'validUntil', dataType: 'date', visible: false, sortable: true },
    { id: 'q_created', label: 'Emitida el', field: 'createdAt', dataType: 'date', visible: true, sortable: true },
  ],
}
