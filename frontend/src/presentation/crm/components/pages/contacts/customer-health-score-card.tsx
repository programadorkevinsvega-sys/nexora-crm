'use client'

import React, { useState, useEffect } from 'react'
import { ApiHealthScoreRepository } from '@src/infrastructure/crm/repositories/health-score/api-health-score.repository'
import type { CustomerHealthScore } from '@crm/contracts'
import { Activity, RefreshCw, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react'

interface Props {
  contactId: string
}

export function CustomerHealthScoreCard({ contactId }: Props) {
  const [data, setData] = useState<CustomerHealthScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    ApiHealthScoreRepository.getContactHealthScore(contactId)
      .then(setData)
      .catch((err) => console.error('Health score error:', err))
      .finally(() => setLoading(false))
  }, [contactId])

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      const updated = await ApiHealthScoreRepository.recalculateContactHealthScore(contactId)
      setData(updated)
    } catch (err: any) {
      alert(err.message || 'Error al recalcular salud de cliente')
    } finally {
      setRecalculating(false)
    }
  }

  if (loading || !data) return null

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-500' }
      case 'NEUTRAL':
        return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-500' }
      case 'AT_RISK':
        return { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-500' }
      default:
        return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-500' }
    }
  }

  const style = getStatusStyle(data.status)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-600" />
          Customer Health Score 360° & Prevención de Churn
        </h3>
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          Recalcular
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className={`p-4 rounded-xl ${style.bg} flex flex-col items-center justify-center text-center`}>
          <span className="text-3xl font-black text-gray-900 dark:text-white">{data.healthScore}/100</span>
          <span className={`text-xs font-bold mt-1 px-2.5 py-0.5 rounded-full text-white ${style.badge}`}>
            {data.status}
          </span>
          <span className="text-[11px] text-gray-500 mt-2">
            Riesgo de Churn: <strong>{data.churnProbability}%</strong>
          </span>
        </div>

        <div className="md:col-span-2 space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300 mb-1 font-medium">
              <span>Interacción & Uso (Engagement)</span>
              <span>{data.engagementScore}/30</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(data.engagementScore / 30) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300 mb-1 font-medium">
              <span>Salud de Soporte (Tickets)</span>
              <span>{data.supportScore}/25</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(data.supportScore / 25) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300 mb-1 font-medium">
              <span>Confiabilidad Comercial (Ventas)</span>
              <span>{data.financialScore}/25</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(data.financialScore / 25) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300 mb-1 font-medium">
              <span>Recencia de Contacto</span>
              <span>{data.recencyScore}/20</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(data.recencyScore / 20) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {data.recommendedAction && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs space-y-1 border border-gray-100 dark:border-gray-800">
          <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Acción Recomendada del Asistente:
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{data.recommendedAction}</p>
        </div>
      )}
    </div>
  )
}
