'use client'

import React, { useState, useEffect } from 'react'
import type { SalesTerritory } from '@crm/contracts'
import { ApiTerritoriesRepository } from '@src/infrastructure/crm/repositories/territories/api-territories.repository'
import { TerritoryCard } from './territory-card'
import { CreateTerritoryModal } from './create-territory-modal'
import { MapPin, Plus, Target, Globe, Building2 } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function TerritoriesDashboardPage() {
  const [territories, setTerritories] = useState<SalesTerritory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchTerritories = async () => {
    setLoading(true)
    try {
      const data = await ApiTerritoriesRepository.listTerritories()
      setTerritories(data || [])
    } catch (err) {
      console.error('Failed to load territories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTerritories()
  }, [])

  const totalQuota = territories.reduce((acc, t) => acc + t.quotaTargetUsd, 0)
  const uniqueCountries = Array.from(new Set(territories.flatMap((t) => t.countryCodes))).length

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <MapPin size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Gestión de Territorios de Ventas
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Jerarquía geográfica, segmentación por industria, cuotas regionales y enrutamiento inteligente de leads.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all"
        >
          <Plus size={14} /> Nuevo Territorio
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Territorios Comerciales Activos</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <MapPin size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{territories.length}</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Cuota Consolidada Global</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Target size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalQuota.toLocaleString()} USD</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Países con Cobertura Directa</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Globe size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{uniqueCountries} Países</p>
        </div>
      </div>

      {/* Territories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Estructura Regional de Ventas</h2>
          <span className="text-xs text-muted-foreground">{territories.length} zonas configuradas</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {territories.map((t) => (
              <TerritoryCard key={t.id} territory={t} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateTerritoryModal
          onClose={() => setShowModal(false)}
          onCreated={fetchTerritories}
        />
      )}
    </div>
  )
}

export default TerritoriesDashboardPage
