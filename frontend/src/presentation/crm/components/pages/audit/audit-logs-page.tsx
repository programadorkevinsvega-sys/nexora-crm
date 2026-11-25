"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Search, RefreshCw, Layers, Eye } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiAuditRepository, AuditLogItem, AuditStats } from "@/src/infrastructure/crm/repositories/audit/api-audit.repository"
import { AuditDiffModal } from "./audit-diff-modal"

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)
  const [actionFilter, setActionFilter] = useState<string>("ALL")
  const [moduleFilter, setModuleFilter] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState<string>("")

  const loadData = async () => {
    try {
      setLoading(true)
      const [logsRes, statsRes] = await Promise.all([
        ApiAuditRepository.listLogs({
          action: actionFilter !== "ALL" ? actionFilter : undefined,
          moduleName: moduleFilter !== "ALL" ? moduleFilter : undefined,
          limit: 50,
        }),
        ApiAuditRepository.getStats().catch(() => ({ totalLogs: 0, byAction: {}, byModule: {} })),
      ])
      setLogs(logsRes.data || [])
      setStats(statsRes)
    } catch (err) {
      console.error("Failed to load audit logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [actionFilter, moduleFilter])

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      log.entityType.toLowerCase().includes(term) ||
      (log.moduleName && log.moduleName.toLowerCase().includes(term)) ||
      (log.fieldName && log.fieldName.toLowerCase().includes(term)) ||
      (log.ipAddress && log.ipAddress.includes(term))
    )
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Registro de Auditoría & Seguridad
          </h1>
          <p className="text-xs text-muted-foreground">
            Trazabilidad corporativa de cambios, accesos y transacciones en tiempo real.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Actualizar Logs
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-muted/20 border">
          <div className="text-xs text-muted-foreground">Total de Eventos</div>
          <div className="text-xl font-bold text-foreground mt-1">{stats?.totalLogs ?? logs.length}</div>
        </Card>
        <Card className="p-4 bg-muted/20 border">
          <div className="text-xs text-muted-foreground">Creaciones (CREATE)</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{stats?.byAction?.['CREATE'] ?? logs.filter(l => l.action === 'CREATE').length}</div>
        </Card>
        <Card className="p-4 bg-muted/20 border">
          <div className="text-xs text-muted-foreground">Actualizaciones (UPDATE)</div>
          <div className="text-xl font-bold text-sky-600 mt-1">{stats?.byAction?.['UPDATE'] ?? logs.filter(l => l.action === 'UPDATE').length}</div>
        </Card>
        <Card className="p-4 bg-muted/20 border">
          <div className="text-xs text-muted-foreground">Eliminaciones (DELETE)</div>
          <div className="text-xl font-bold text-rose-600 mt-1">{stats?.byAction?.['DELETE'] ?? logs.filter(l => l.action === 'DELETE').length}</div>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/20 border rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por entidad, campo o IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-background border rounded px-2.5 py-1.5"
          >
            <option value="ALL">Todas las Acciones</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs bg-background border rounded px-2.5 py-1.5"
          >
            <option value="ALL">Todos los Módulos</option>
            <option value="contacts">Contacts</option>
            <option value="deals">Deals</option>
            <option value="quotes">Quotes</option>
            <option value="contracts">Contracts</option>
            <option value="auth">Auth & Security</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="p-0 border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
            <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-semibold text-foreground">No hay registros de auditoría que coincidan</p>
            <p>Los cambios en contactos, tratos, cotizaciones y sesiones se registran automáticamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="p-3">Fecha & Hora</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Módulo & Entidad</th>
                  <th className="p-3">Campo Modificado</th>
                  <th className="p-3">Origen (IP)</th>
                  <th className="p-3 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => {
                  const actionColor =
                    log.action === "CREATE"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : log.action === "DELETE"
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : log.action === "LOGIN"
                      ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                      : "bg-sky-500/10 text-sky-600 border-sky-500/20"

                  return (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3 text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${actionColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{log.moduleName || log.entityType}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {log.fieldName ? (
                          <span className="font-mono text-[11px] bg-muted/30 px-1.5 py-0.5 rounded text-foreground">
                            {log.fieldName}
                          </span>
                        ) : (
                          <span>Registro Completo</span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground font-mono text-[11px]">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Ver Diff
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Diff Inspector Modal */}
      {selectedLog && (
        <AuditDiffModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  )
}
