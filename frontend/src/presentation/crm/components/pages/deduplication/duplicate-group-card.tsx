'use client'

import React, { useState } from 'react'
import type { DuplicateGroup, DeduplicationEntityType } from '@crm/contracts'
import { ApiDeduplicationRepository } from '@src/infrastructure/crm/repositories/deduplication/api-deduplication.repository'
import { Merge, Check, User, Building, Clock, ArrowRight } from 'lucide-react'

interface Props {
  group: DuplicateGroup
  entityType: DeduplicationEntityType
  onMerged: () => void
}

export function DuplicateGroupCard({ group, entityType, onMerged }: Props) {
  const [masterId, setMasterId] = useState(group.records[0]?.id)
  const [loading, setLoading] = useState(false)

  const handleMerge = async () => {
    const duplicate = group.records.find((r) => r.id !== masterId)
    if (!duplicate || !masterId) return

    setLoading(true)
    try {
      await ApiDeduplicationRepository.mergeRecords({
        entityType,
        masterRecordId: masterId,
        duplicateRecordId: duplicate.id,
        matchedByField: group.matchField,
      })
      onMerged()
    } catch (err: any) {
      alert(err.message || 'Error al fusionar registros')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-amber-500/30 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Coincidencia por {group.matchField}: {group.matchValue}
          </span>
          <span className="text-xs text-muted-foreground font-mono font-bold">
            {group.similarityScore}% Similitud
          </span>
        </div>
        <button
          onClick={handleMerge}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          <Merge size={13} /> {loading ? 'Fusionando...' : 'Auto-Merge'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {group.records.map((r, idx) => {
          const isSelected = r.id === masterId
          return (
            <div
              key={r.id}
              onClick={() => setMasterId(r.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border bg-background hover:border-muted-foreground/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {idx === 0 ? 'Registro A' : 'Registro B'}
                </span>
                {isSelected ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Check size={11} /> Registro Principal (Master)
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Clic para hacer Master</span>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  {entityType === 'CONTACT' ? <User size={13} /> : <Building size={13} />}
                  {r.name}
                </p>
                {r.email && <p className="text-muted-foreground">{r.email}</p>}
                {r.phone && <p className="text-muted-foreground">{r.phone}</p>}
                {r.companyName && <p className="text-muted-foreground font-medium">{r.companyName}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
