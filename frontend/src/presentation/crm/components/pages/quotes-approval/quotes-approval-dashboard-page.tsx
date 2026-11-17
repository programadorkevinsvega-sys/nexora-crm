'use client'

import React, { useState, useEffect } from 'react'
import type { DiscountApprovalRule, QuoteApprovalRequest } from '@crm/contracts'
import { ApiQuotesApprovalRepository } from '@src/infrastructure/crm/repositories/quotes-approval/api-quotes-approval.repository'
import { CheckCircle, XCircle, Clock, Percent, Shield, ArrowRight, ExternalLink } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function QuotesApprovalDashboardPage() {
  const [rules, setRules] = useState<DiscountApprovalRule[]>([])
  const [requests, setRequests] = useState<QuoteApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rulesData, reqData] = await Promise.all([
        ApiQuotesApprovalRepository.listRules(),
        ApiQuotesApprovalRepository.listRequests(),
      ])
      setRules(rulesData || [])
      setRequests(reqData || [])
    } catch (err) {
      console.error('Failed to load quote approvals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await ApiQuotesApprovalRepository.reviewApproval(id, status, `Evaluado por Gerencia Comercial`)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Error al procesar solicitud')
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Percent size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Aprobación de Descuentos & Cotizaciones CPQ
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Enterprise Governance
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Matriz de gobernanza comercial multinivel para autorización de márgenes y enlaces públicos de aceptación digital.
          </p>
        </div>
      </div>

      {/* Discount Approval Thresholds */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Matriz de Autorización por Nivel Jerárquico</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rules.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">{r.approverRole}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {r.minDiscountPct}% - {r.maxDiscountPct}%
                </span>
              </div>
              <p className="text-sm font-bold text-foreground">
                Requiere autorización formal de {r.approverRole.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Approval Requests */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-foreground">Solicitudes de Aprobación de Cotizaciones</h2>
        {loading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : requests.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-1">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Sin Aprobaciones Pendientes</h3>
            <p className="text-xs text-muted-foreground">Todas las cotizaciones se encuentran dentro de las directrices estándar de precios.</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">Cotización ID</th>
                  <th className="p-3">Descuento Solicitado</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Fecha Solicitud</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono font-bold text-primary">{req.quoteId.slice(0, 8)}...</td>
                    <td className="p-3 font-bold text-rose-500">{req.requestedDiscountPct}% OFF</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                        req.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right space-x-2">
                      {req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReview(req.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReview(req.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
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

export default QuotesApprovalDashboardPage
