'use client'

import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Sparkles, Calendar } from 'lucide-react'
import { useAuth } from '@/src/presentation/hooks/use-auth'
import { container } from '@src/application/crm/di/container'
import { DI_TOKENS } from '@src/application/crm/di/tokens'
import { DashboardKpiGrid } from './dashboard-kpi-grid'
import { DashboardPipelineWidget } from './dashboard-pipeline-widget'
import { DashboardAiSdrWidget } from './dashboard-ai-sdr-widget'
import { DashboardHealthChurnWidget } from './dashboard-health-churn-widget'
import { DashboardQuickActions } from './dashboard-quick-actions'
import type { ContactRepository } from '@/src/domain/crm/contacts/contact.repository'
import type { IDealRepository } from '@/src/domain/crm/deals/deal.repository'
import type { Contact } from '@/src/domain/crm/contacts/contact.entity'
import type { Deal } from '@/src/domain/crm/deals/deal.entity'

export function DashboardPage() {
  const { tenantId, userName } = useAuth()

  const contactsQuery = useQuery({
    queryKey: ['contacts', tenantId],
    queryFn: () => {
      if (!tenantId) throw new Error('Tenant context is required to load contacts')
      return container.resolve<ContactRepository>(DI_TOKENS.ContactRepository).list({ tenantId, limit: 50 })
    },
    enabled: Boolean(tenantId),
  })

  const dealsQuery = useQuery({
    queryKey: ['deals', tenantId],
    queryFn: () => container.resolve<IDealRepository>(DI_TOKENS.DealRepository).list({ status: 'OPEN', limit: 50 }),
    enabled: Boolean(tenantId),
  })

  const dealsList: Deal[] = dealsQuery.data?.data ?? []
  const contactsList: Contact[] = contactsQuery.data?.data ?? []
  const totalDeals = dealsList.length
  const currencies = new Set(dealsList.map((deal) => deal.currency).filter((currency): currency is string => Boolean(currency)))
  const pipelineCurrency = currencies.size === 1 ? Array.from(currencies)[0] : null
  const pipelineValue = pipelineCurrency === null
    ? null
    : dealsList.reduce((total, deal) => total + (deal.value ?? 0), 0)

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Centro de Mando Comercial</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Sparkles size={11} /> CRM
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Bienvenido, <strong className="text-foreground">{userName || 'Usuario'}</strong> • Resumen de oportunidades y contactos registrados.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/booking" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors">
            <Calendar size={13} /> Agendamiento
          </Link>
          <Link href="/pipelines/deals/new" className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all">
            <Plus size={14} /> Nueva Oportunidad
          </Link>
        </div>
      </div>

      <DashboardKpiGrid
        dealsCount={totalDeals}
        pipelineValue={pipelineValue}
        pipelineCurrency={pipelineCurrency}
        leadsCount={contactsList.length}
        avgHealthScore={null}
        openConversations={null}
        upcomingBookings={null}
        loading={dealsQuery.isLoading || contactsQuery.isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPipelineWidget deals={dealsList} loading={dealsQuery.isLoading} />
        <DashboardAiSdrWidget contacts={contactsList} loading={contactsQuery.isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardHealthChurnWidget />
        <DashboardQuickActions />
      </div>
    </div>
  )
}

export default DashboardPage
