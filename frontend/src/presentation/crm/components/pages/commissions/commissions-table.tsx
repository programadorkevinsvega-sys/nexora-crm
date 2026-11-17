'use client'

import React from 'react'
import type { CommissionRecord } from '@crm/contracts'
import { ApiCommissionsRepository } from '@src/infrastructure/crm/repositories/commissions/api-commissions.repository'
import { Check, DollarSign, CheckCircle2, Clock, XCircle } from 'lucide-react'

interface Props {
  records: CommissionRecord[]
  onRefresh: () => void
}

export function CommissionsTable({ records, onRefresh }: Props) {
  const handleApprove = async (id: string) => {
    try {
      await ApiCommissionsRepository.approveRecord(id)
      onRefresh()
    } catch (err: any) {
      alert(err.message || 'Error al aprobar comisión')
    }
  }

  const handlePay = async (id: string) => {
    try {
      await ApiCommissionsRepository.markAsPaid(id)
      onRefresh()
    } catch (err: any) {
      alert(err.message || 'Error al liquidar comisión')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">🟢 Liquidada / Pagada</span>
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">🔵 Aprobada (Pendiente Pago)</span>
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">🔴 Rechazada</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">🟡 Pendiente Aprobación</span>
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5">Período</th>
              <th className="p-3.5">Valor Oportunidad</th>
              <th className="p-3.5">Tasa (%)</th>
              <th className="p-3.5">Split</th>
              <th className="p-3.5">Monto Comisión</th>
              <th className="p-3.5">Estado</th>
              <th className="p-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No hay asientos de comisión registrados para este período.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-bold text-foreground font-mono">{r.period}</td>
                  <td className="p-3.5 text-foreground font-semibold">${r.dealValue.toLocaleString()}</td>
                  <td className="p-3.5 text-foreground">{r.commissionRate}%</td>
                  <td className="p-3.5 text-muted-foreground">{r.splitPercentage}%</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${r.commissionAmount.toLocaleString()}
                  </td>
                  <td className="p-3.5">{getStatusBadge(r.status)}</td>
                  <td className="p-3.5 text-right space-x-2">
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Check size={12} /> Aprobar
                      </button>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        onClick={() => handlePay(r.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <DollarSign size={12} /> Liquidar Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
