'use client'

import React, { useState, useEffect } from 'react'
import type { SlaPolicy, TicketSlaTracker } from '@crm/contracts'
import { ApiSlaRepository } from '@src/infrastructure/crm/repositories/sla/api-sla.repository'
import { CreateSlaPolicyModal } from './create-sla-policy-modal'
import { ShieldAlert, Plus, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Flame } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function SlaDashboardPage() {
  const [policies, setPolicies] = useState<SlaPolicy[]>([])
  const [trackers, setTrackers] = useState<TicketSlaTracker[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [policiesData, trackersData] = await Promise.all([
        ApiSlaRepository.listPolicies(),
        ApiSlaRepository.listTrackers(),
      ])
      setPolicies(policiesData || [])
      setTrackers(trackersData || [])
    } catch (err) {
      console.error('Failed to load SLA data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const breachedCount = trackers.filter((t) => t.isFirstResponseBreached || t.isResolutionBreached).length
  const complianceRate = trackers.length === 0 ? (policies.length > 0 ? 100 : 0) : Math.round(((trackers.length - breachedCount) / trackers.length) * 100)

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500"><ShieldAlert size={20} /></div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Políticas de SLA & Escalación Automática</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">Enterprise</span>
          </div>
          <p className="text-xs text-muted-foreground">Acuerdos de nivel de servicio (SLA) multinivel, garantías de primera respuesta y matriz de escalación automática.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-sm transition-all">
          <Plus size={14} /> Nueva Política SLA
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Políticas SLA Activas</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500"><ShieldCheck size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{policies.length} Políticas</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Cumplimiento de SLA Global</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle2 size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{complianceRate}%</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tickets en Brecha de SLA</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500"><AlertTriangle size={16} /></div>
          </div>
          <p className="text-2xl font-bold text-rose-400">{breachedCount} Tickets</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Políticas de SLA Configuradas</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {policies.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl border border-border p-5 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground">Prioridad: {p.priority}</span>
                    {p.isDefault && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Por Defecto</span>}
                  </div>
                  <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.description || 'Política de atención estándar para tickets.'}</p>
                </div>
                <div className="pt-3 border-t border-border space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>1ra Respuesta:</span>
                    <strong className="text-foreground font-mono">{p.firstResponseTimeMinutes} min</strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Resolución Final:</span>
                    <strong className="text-foreground font-mono">{p.resolutionTimeMinutes} min</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SLA Trackers Table */}
      {trackers.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-sm font-bold text-foreground">Monitoreo de SLAs en Tickets en Vivo</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">1ra Respuesta Límite</th>
                  <th className="px-4 py-3">Resolución Límite</th>
                  <th className="px-4 py-3">Estado SLA</th>
                  <th className="px-4 py-3">Nivel Escalamiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trackers.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-slate-300">{t.ticketId.substring(0, 8)}...</td>
                    <td className="px-4 py-3 font-mono text-foreground">{new Date(t.firstResponseDueAt).toLocaleTimeString()}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{new Date(t.resolutionDueAt).toLocaleTimeString()}</td>
                    <td className="px-4 py-3">
                      {t.isResolutionBreached ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Incumplido (Breach)</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">En Tiempo (Compliant)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-cyan-400">Nivel {t.escalationLevelReached}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <CreateSlaPolicyModal onClose={() => setShowModal(false)} onCreated={fetchData} />}
    </div>
  )
}
export default SlaDashboardPage
