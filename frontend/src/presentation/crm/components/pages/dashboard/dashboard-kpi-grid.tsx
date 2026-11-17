'use client'

import React from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Sparkles,
  Users,
  HeartPulse,
  TrendingUp,
  MessageSquare,
  CalendarCheck,
  CreditCard,
} from 'lucide-react'
import { Skeleton } from '@/src/presentation/crm/components/ui/Skeleton'

interface Props {
  dealsCount: number
  pipelineValue: number
  leadsCount: number
  bantSqlCount: number
  avgHealthScore: number
  openConversations: number
  upcomingBookings: number
  loading?: boolean
}

export function DashboardKpiGrid({
  dealsCount,
  pipelineValue,
  leadsCount,
  bantSqlCount,
  avgHealthScore,
  openConversations,
  upcomingBookings,
  loading,
}: Props) {
  const cards = [
    {
      title: 'Pipeline de Ventas Activo',
      value: `$${pipelineValue.toLocaleString()}`,
      subtext: `${dealsCount} negociaciones en curso`,
      badge: 'En tiempo real',
      badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
      icon: DollarSign,
      href: '/pipelines',
      iconColor: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'AI SDR: Leads BANT (SQL)',
      value: bantSqlCount,
      subtext: `de ${leadsCount} prospectos calificados 24/7`,
      badge: '✨ Calificación IA',
      badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50',
      icon: Sparkles,
      href: '/contacts',
      iconColor: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      title: 'Salud Promedio Clientes 360°',
      value: `${avgHealthScore}%`,
      subtext: 'Índice de retención B2B',
      badge: avgHealthScore >= 75 ? '🟢 Óptimo' : '🟡 Atención',
      badgeColor: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50',
      icon: HeartPulse,
      href: '/contacts',
      iconColor: 'text-teal-500 bg-teal-500/10',
    },
    {
      title: 'Reuniones & Demos /meet',
      value: upcomingBookings,
      subtext: `${openConversations} conversaciones activas`,
      badge: 'Google Meet & Zoom',
      badgeColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50',
      icon: CalendarCheck,
      href: '/booking',
      iconColor: 'text-sky-500 bg-sky-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <Link
            key={i}
            href={c.href}
            className="bg-card rounded-xl p-5 border border-border hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${c.iconColor}`}>
                <Icon size={18} />
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.badgeColor}`}>
                {c.badge}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{c.title}</p>
              {loading ? (
                <Skeleton className="h-8 w-24 my-1" />
              ) : (
                <p className="text-2xl font-bold tracking-tight text-foreground">{c.value}</p>
              )}
              <p className="text-[11px] text-muted-foreground">{c.subtext}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
