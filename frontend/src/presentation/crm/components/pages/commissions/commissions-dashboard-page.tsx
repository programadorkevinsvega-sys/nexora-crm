'use client'

import React, { useState, useEffect } from 'react'
import type { CommissionPlan, CommissionRecord } from '@crm/contracts'
import { ApiCommissionsRepository } from '@src/infrastructure/crm/repositories/commissions/api-commissions.repository'
import { CommissionsTable } from './commissions-table'
import { CreateCommissionPlanModal } from './create-commission-plan-modal'
import { Award, Plus, DollarSign, Clock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function CommissionsDashboardPage() {
  const [plans, setPlans] = useState<CommissionPlan[]>([])
  const [records, setRecords] = useState<CommissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [plansData, recordsData] = await Promise.all([
        ApiCommissionsRepository.listPlans(),
        ApiCommissionsRepository.listRecords(),
      ])
      setPlans(plansData || [])
      setRecords(recordsData || [])
    } catch (err) {
      console.error('Failed to load commissions data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalPaid = records
    .filter((r) => r.status === 'PAID')
    .reduce((acc, r) => acc + r.commissionAmount, 0)

  const totalPending = records
    .filter((r) => r.status === 'PENDING' || r.status === 'APPROVED')
    .reduce((acc, r) => acc + r.commissionAmount, 0)

  const activePlan = plans.find((p) => p.isActive) || plans[0]

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Award size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Comisiones de Ventas & Compensación (SPM)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Gestión automatizada de planes de comisiones, aceleradores por cuota cumplida y liquidación de pagos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all"
        >
          <Plus size={14} /> Nuevo Plan de Comisiones
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Comisiones Liquidadas (Pagadas)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalPaid.toLocaleString()}</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Por Liquidar (Pendientes)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalPending.toLocaleString()}</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Plan Comercial Vigente</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-sm font-bold text-foreground line-clamp-1">{activePlan?.name || 'Plan Estándar'}</p>
          <p className="text-[11px] text-muted-foreground">
            Tasa: <strong>{activePlan?.baseRate || 5}%</strong> {activePlan?.acceleratorRate ? `(Acel: ${activePlan.acceleratorRate}%)` : ''}
          </p>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Asientos y Liquidaciones de Comisiones</h2>
          <span className="text-xs text-muted-foreground">{records.length} registros</span>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <CommissionsTable records={records} onRefresh={fetchData} />
        )}
      </div>

      {showModal && (
        <CreateCommissionPlanModal
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  )
}

export default CommissionsDashboardPage
