'use client'

import React, { useState, useEffect } from 'react'
import type { CustomerSurvey, SurveyAnalyticsSummary } from '@crm/contracts'
import { ApiSurveysRepository } from '@src/infrastructure/crm/repositories/surveys/api-surveys.repository'
import { CreateSurveyModal } from './create-survey-modal'
import { HeartHandshake, Plus, Smile, Meh, Frown, Sparkles, BarChart3, Star } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

export function SurveysDashboardPage() {
  const [surveys, setSurveys] = useState<CustomerSurvey[]>([])
  const [analytics, setAnalytics] = useState<SurveyAnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [surveysData, analyticsData] = await Promise.all([
        ApiSurveysRepository.listSurveys(),
        ApiSurveysRepository.getAnalytics(),
      ])
      setSurveys(surveysData || [])
      setAnalytics(analyticsData || null)
    } catch (err) {
      console.error('Failed to load surveys data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
              <HeartHandshake size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Encuestas de Satisfacción CSAT & NPS
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">
              Customer Experience (CX)
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Medición automatizada de lealtad, Net Promoter Score y calificación de experiencia del cliente en postventa.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          <Plus size={16} /> Nueva Encuesta
        </button>
      </div>

      {/* Analytics KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl border border-border p-5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-muted-foreground">Net Promoter Score (NPS)</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-foreground">+{analytics.npsScore}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                World-Class
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
              <div style={{ width: `${analytics.promotersPct}%` }} className="bg-emerald-500" />
              <div style={{ width: `${analytics.passivesPct}%` }} className="bg-amber-500" />
              <div style={{ width: `${analytics.detractorsPct}%` }} className="bg-rose-500" />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-muted-foreground">Promedio CSAT de Soporte</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-foreground">{analytics.csatAverage}</span>
              <div className="flex text-amber-500">
                <Star size={16} fill="currentColor" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Calificación sobre 5.0 estrellas</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-muted-foreground">Promotores Activos</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-emerald-500">{analytics.promotersPct}%</span>
              <Smile size={20} className="text-emerald-500" />
            </div>
            <p className="text-[10px] text-muted-foreground">Clientes con score 9-10</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-muted-foreground">Detractores</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-rose-500">{analytics.detractorsPct}%</span>
              <Frown size={20} className="text-rose-500" />
            </div>
            <p className="text-[10px] text-muted-foreground">Riesgo de abandono detectado</p>
          </div>
        </div>
      )}

      {/* Configured Surveys List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Encuestas Activas y Disparadores</h2>
        {loading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {surveys.map((s) => (
              <div key={s.id} className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">
                    {s.type}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Disparador: {s.triggerEvent}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{s.name}</h3>
                <p className="text-xs text-muted-foreground italic">&ldquo;{s.questionText}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateSurveyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}

export default SurveysDashboardPage
