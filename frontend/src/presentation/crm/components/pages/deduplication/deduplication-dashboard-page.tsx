'use client'

import React, { useState, useEffect } from 'react'
import type { DeduplicationRule, DuplicateGroup, DeduplicationEntityType, DeduplicationAuditLog } from '@crm/contracts'
import { ApiDeduplicationRepository } from '@src/infrastructure/crm/repositories/deduplication/api-deduplication.repository'
import { DuplicateGroupCard } from './duplicate-group-card'
import { Layers, Scan, CheckCircle2, AlertCircle, History, Sparkles, ShieldCheck } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function DeduplicationDashboardPage() {
  const [entityType, setEntityType] = useState<DeduplicationEntityType>('CONTACT')
  const [rules, setRules] = useState<DeduplicationRule[]>([])
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([])
  const [auditLogs, setAuditLogs] = useState<DeduplicationAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rulesData, logsData] = await Promise.all([
        ApiDeduplicationRepository.listRules(),
        ApiDeduplicationRepository.listAuditLogs(),
      ])
      setRules(rulesData || [])
      setAuditLogs(logsData || [])
      await handleScan(entityType)
    } catch (err) {
      console.error('Failed to load deduplication data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async (type: DeduplicationEntityType) => {
    setScanning(true)
    try {
      const dups = await ApiDeduplicationRepository.scanDuplicates(type)
      setDuplicateGroups(dups || [])
    } catch (err) {
      console.error('Scan error:', err)
    } finally {
      setScanning(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onTabChange = (type: DeduplicationEntityType) => {
    setEntityType(type)
    handleScan(type)
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Limpieza & Deduplicación de Registros
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Data Quality
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Detección inteligente de duplicados por correo, dominio y similitud fonética/Levenshtein con fusión segura en 1 clic.
          </p>
        </div>

        <button
          onClick={() => handleScan(entityType)}
          disabled={scanning}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          <Scan size={14} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Escaneando Base de Datos...' : 'Escanear Duplicados'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => onTabChange('CONTACT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            entityType === 'CONTACT'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Duplicados en Contactos
        </button>
        <button
          onClick={() => onTabChange('COMPANY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            entityType === 'COMPANY'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Duplicados en Empresas
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {loading || scanning ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : duplicateGroups.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-1">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Base de Datos 100% Limpia</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No se encontraron registros duplicados de {entityType === 'CONTACT' ? 'contactos' : 'empresas'}. Todos los registros son únicos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {duplicateGroups.length} Grupo(s) de Duplicados Detectados
              </span>
            </div>
            {duplicateGroups.map((g, idx) => (
              <DuplicateGroupCard
                key={idx}
                group={g}
                entityType={entityType}
                onMerged={() => handleScan(entityType)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Audit Logs */}
      {auditLogs.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <History size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Historial de Fusiones Recientes</h3>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Campo Match</th>
                  <th className="p-3">Registro Maestro</th>
                  <th className="p-3">Registro Fusionado</th>
                  <th className="p-3 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="p-3 font-bold text-foreground">{log.entityType}</td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">{log.matchedByField}</td>
                    <td className="p-3 font-mono text-[11px] text-primary">{log.masterRecordId}</td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground line-through">{log.mergedRecordId}</td>
                    <td className="p-3 text-right text-muted-foreground">{new Date(log.mergedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeduplicationDashboardPage
