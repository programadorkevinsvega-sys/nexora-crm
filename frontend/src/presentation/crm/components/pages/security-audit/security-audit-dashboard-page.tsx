'use client'

import React, { useState, useEffect } from 'react'
import type { SecurityAccessLog, SecurityAnomaly } from '@crm/contracts'
import { ApiSecurityAuditRepository } from '@src/infrastructure/crm/repositories/security-audit/api-security-audit.repository'
import { ShieldCheck, ShieldAlert, AlertTriangle, Globe, MapPin, CheckCircle, Smartphone, Monitor } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function SecurityAuditDashboardPage() {
  const [logs, setLogs] = useState<SecurityAccessLog[]>([])
  const [anomalies, setAnomalies] = useState<SecurityAnomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [logsData, anomData] = await Promise.all([
        ApiSecurityAuditRepository.listLogs(),
        ApiSecurityAuditRepository.listAnomalies(),
      ])
      setLogs(logsData || [])
      setAnomalies(anomData || [])
    } catch (err) {
      console.error('Failed to load security audit data:', err)
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos de auditoría de seguridad.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleResolve = async (id: string) => {
    setError(null)
    try {
      await ApiSecurityAuditRepository.resolveAnomaly(id, { notes: 'Revisado y mitigado por el administrador' })
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo resolver la alerta de seguridad.')
    }
  }

  const activeAnomalies = anomalies.filter((a) => !a.isResolved)

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Auditoría Forense & Detección de Anomalías de Acceso
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              SOC & SecOps
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitoreo en tiempo real de inicios de sesión, geolocalización IP y detección de viajes imposibles / ataques de fuerza bruta.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500">
          {error}
        </div>
      )}

      {/* Security Alerts Banner */}
      {activeAnomalies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
            <AlertTriangle size={16} />
            <span>{activeAnomalies.length} Alerta(s) Crítica(s) de Seguridad Detectadas</span>
          </div>
          <div className="space-y-2">
            {activeAnomalies.map((anom) => (
              <div key={anom.id} className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white">
                      {anom.anomalyType}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(anom.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{anom.description}</p>
                </div>
                <button
                  onClick={() => handleResolve(anom.id)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
                >
                  Mitigar & Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access Logs Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Bitácora de Sesiones & Accesos Recientes</h2>
        {loading ? (
          <Skeleton className="h-60 w-full rounded-2xl" />
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">Dirección IP</th>
                  <th className="p-3">Ubicación Geo-IP</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Dispositivo / Agente</th>
                  <th className="p-3 text-right">Fecha & Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono font-bold text-foreground">{log.ipAddress}</td>
                    <td className="p-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-primary" />
                        <span>{log.city || 'Desconocido'}, {log.country || 'CO'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.loginStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                        log.loginStatus === 'BLOCKED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {log.loginStatus}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground truncate max-w-xs">{log.userAgent || 'App Browser'}</td>
                    <td className="p-3 text-right text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SecurityAuditDashboardPage
