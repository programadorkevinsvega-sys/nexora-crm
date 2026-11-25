'use client'

import React from 'react'
import Link from 'next/link'
import { DollarSign, Users, HeartPulse, CalendarCheck } from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

interface Props {
  dealsCount: number
  pipelineValue: number | null
  pipelineCurrency: string | null
  leadsCount: number
  avgHealthScore: number | null
  openConversations: number | null
  upcomingBookings: number | null
  loading?: boolean
}

export function DashboardKpiGrid({
  dealsCount,
  pipelineValue,
  pipelineCurrency,
  leadsCount,
  avgHealthScore,
  openConversations,
  upcomingBookings,
  loading,
}: Props) {
  const currencyMismatch = pipelineValue === null && dealsCount > 0
  const cards = [
    {
      title: 'Pipeline de ventas',
      value: pipelineValue !== null && pipelineCurrency
        ? `${pipelineCurrency} ${pipelineValue.toLocaleString()}`
        : '—',
      subtext: currencyMismatch
        ? `${dealsCount} oportunidades; total no comparable entre monedas`
        : `${dealsCount} oportunidades abiertas`,
      badge: pipelineValue !== null ? 'Calculado' : 'Sin total',
      icon: DollarSign,
      href: '/pipelines',
      iconColor: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Contactos registrados',
      value: leadsCount,
      subtext: 'Contactos cargados en el CRM',
      badge: 'CRM',
      icon: Users,
      href: '/contacts',
      iconColor: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      title: 'Salud de clientes',
      value: avgHealthScore === null ? '—' : `${avgHealthScore}%`,
      subtext: avgHealthScore === null ? 'Métrica no disponible en la API actual' : 'Índice de salud registrado',
      badge: avgHealthScore === null ? 'Sin datos' : 'Disponible',
      icon: HeartPulse,
      href: '/contacts',
      iconColor: 'text-teal-500 bg-teal-500/10',
    },
    {
      title: 'Reuniones y conversaciones',
      value: upcomingBookings === null ? '—' : upcomingBookings,
      subtext: openConversations === null
        ? 'No hay métricas de agenda o conversaciones disponibles'
        : `${openConversations} conversaciones activas`,
      badge: upcomingBookings === null ? 'Sin datos' : 'Disponible',
      icon: CalendarCheck,
      href: '/booking',
      iconColor: 'text-sky-500 bg-sky-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Link
            key={card.title}
            href={card.href}
            className="bg-card rounded-xl p-5 border border-border hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${card.iconColor}`}>
                <Icon size={18} />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {card.badge}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
              {loading ? <Skeleton className="h-8 w-24 my-1" /> : <p className="text-2xl font-bold tracking-tight text-foreground">{card.value}</p>}
              <p className="text-[11px] text-muted-foreground">{card.subtext}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
