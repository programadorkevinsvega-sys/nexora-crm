'use client'

import React, { useState, useEffect } from 'react'
import type { PartnerTier, Partner, PartnerDealRegistration } from '@crm/contracts'
import { ApiPrmRepository } from '@src/infrastructure/crm/repositories/prm/api-prm.repository'
import { RegisterPartnerDealModal } from './register-partner-deal-modal'
import { PartnerTiersGrid } from './partner-tiers-grid'
import { Handshake, Plus, ShieldCheck, DollarSign, Award } from 'lucide-react'

export function PrmDashboardPage() {
  const [tiers, setTiers] = useState<PartnerTier[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [dealRegistrations, setDealRegistrations] = useState<PartnerDealRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tiersData, partnersData, dealsData] = await Promise.all([
        ApiPrmRepository.listTiers(),
        ApiPrmRepository.listPartners(),
        ApiPrmRepository.listDealRegistrations(),
      ])
      setTiers(tiersData || [])
      setPartners(partnersData || [])
      setDealRegistrations(dealsData || [])
    } catch (err) {
      console.error('Failed to load PRM data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalPartnerPipeline = dealRegistrations.reduce((acc, d) => acc + d.estimatedValueUsd, 0)

  const handleApprove = async (id: string) => {
    try {
      await ApiPrmRepository.approveDealRegistration(id)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Error al aprobar registro de deal')
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Handshake size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Portal de Partners & Canales (PRM)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Gestión de ecosistema de socios de canal, niveles de certificación (Tiers) y registro protegido de oportunidades.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all"
        >
          <Plus size={14} /> Registrar Oportunidad Partner
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Partners Homologados</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Handshake size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{partners.length} Socios</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pipeline Protegido en Canales</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalPartnerPipeline.toLocaleString()} USD</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Nivel Top (Margen de Canal)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Award size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">35% Margen Platinum</p>
        </div>
      </div>

      {/* Partner Tiers Grid */}
      <PartnerTiersGrid tiers={tiers} />

      {/* Deal Registrations Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Oportunidades Registradas y Protegidas</h2>
          <span className="text-xs text-muted-foreground">{dealRegistrations.length} solicitudes</span>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">Empresa Prospecto</th>
                <th className="p-3.5">Email Contacto</th>
                <th className="p-3.5">Valor Estimado</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dealRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No hay oportunidades registradas por partners en este período.
                  </td>
                </tr>
              ) : (
                dealRegistrations.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-bold text-foreground">{d.prospectCompanyName}</td>
                    <td className="p-3.5 text-muted-foreground font-mono">{d.contactEmail}</td>
                    <td className="p-3.5 font-bold text-foreground">${d.estimatedValueUsd.toLocaleString()} USD</td>
                    <td className="p-3.5 text-muted-foreground">{d.productCategory}</td>
                    <td className="p-3.5">
                      {d.status === 'APPROVED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          🛡️ Protegido (Aprobado)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          ⏳ En Revisión
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {d.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleApprove(d.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <ShieldCheck size={12} /> Aprobar Protección
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

      {showModal && (
        <RegisterPartnerDealModal
          partners={partners}
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  )
}

export default PrmDashboardPage
