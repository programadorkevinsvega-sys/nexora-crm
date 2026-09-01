"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Building2, Users, TrendingUp, TicketCheck, ArrowUpRight, Plus, Sparkles, Phone, FileText } from "lucide-react"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { ActivityTimeline } from "@/src/presentation/crm/components/common/ActivityTimeline"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { container } from "@src/application/crm/di/container"
import { DI_TOKENS } from "@src/application/crm/di/tokens"

const resolveRepo = <T,>(token: symbol) => container.resolve<T>(token)

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: string
  color: "blue" | "emerald" | "amber" | "purple"
  loading?: boolean
  href?: string
}

function StatCard({ icon, label, value, trend, color, loading, href }: StatCardProps) {
  const colorStyles = {
    blue: "from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-400 border-purple-500/20",
  }[color]

  const Content = (
    <div className="relative p-5 rounded-2xl bg-[#0f1420]/80 border border-white/[0.08] backdrop-blur-md shadow-lg shadow-black/20 hover:border-white/[0.16] transition-all group overflow-hidden">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorStyles} border shrink-0`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {trend} <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-20 bg-white/[0.06]" />
        ) : (
          <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
        )}
      </div>
    </div>
  )

  return href ? <Link href={href}>{Content}</Link> : Content
}

export function DashboardPage() {
  const { tenantId } = useAuth()

  const companiesQuery = useQuery({
    queryKey: ["companies", tenantId],
    queryFn: () => resolveRepo<any>(DI_TOKENS.CompanyRepository).list({ tenantId: tenantId!, limit: 1 }),
    enabled: !!tenantId,
  })

  const contactsQuery = useQuery({
    queryKey: ["contacts", tenantId],
    queryFn: () => resolveRepo<any>(DI_TOKENS.ContactRepository).list({ tenantId: tenantId!, limit: 1 }),
    enabled: !!tenantId,
  })

  const dealsQuery = useQuery({
    queryKey: ["deals", tenantId],
    queryFn: () => resolveRepo<any>(DI_TOKENS.DealRepository).list({ status: "OPEN", limit: 1 }),
    enabled: !!tenantId,
  })

  const ticketsQuery = useQuery({
    queryKey: ["tickets", tenantId],
    queryFn: () => resolveRepo<any>(DI_TOKENS.TicketRepository).list({ limit: 5 }),
    enabled: !!tenantId,
  })

  const queryError = companiesQuery.error || contactsQuery.error || dealsQuery.error || ticketsQuery.error
  const isAnyError = companiesQuery.isError || contactsQuery.isError || dealsQuery.isError || ticketsQuery.isError

  const totalCompanies = companiesQuery.data?.data.length ?? 0
  const totalContacts = contactsQuery.data?.data.length ?? 0
  const totalOpenDeals = dealsQuery.data?.data.length ?? 0
  const totalOpenTickets = ticketsQuery.data?.data.length ?? 0

  const recentActivity = [
    ...(companiesQuery.data?.data ?? []).map((c: any) => ({
      id: `company-${c.id}`,
      type: "system" as const,
      content: `Empresa "${c.name}" creada`,
      date: new Date(c.createdAt).toLocaleDateString(),
      author: "Sistema",
    })),
    ...(ticketsQuery.data?.data ?? []).map((t: any) => ({
      id: `ticket-${t.id}`,
      type: "note" as const,
      content: `Ticket "${t.subject}" recibido`,
      date: new Date(t.createdAt).toLocaleDateString(),
      author: "Soporte",
    })),
  ]

  if (isAnyError) return <ErrorState message={(queryError as Error)?.message} />

  return (
    <div className="space-y-6">
      {/* Header with quick stats greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Panel de Control <Sparkles className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">Resumen ejecutivo en tiempo real de tu CRM</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/contacts"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" /> Nuevo Contacto
          </Link>
          <Link
            href="/pipelines/deals/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 border border-blue-400/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva Oportunidad
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Empresas Registradas"
          value={totalCompanies}
          trend="+12%"
          color="blue"
          href="/companies"
          loading={companiesQuery.isLoading}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Contactos & Leads"
          value={totalContacts}
          trend="+8%"
          color="emerald"
          href="/contacts"
          loading={contactsQuery.isLoading}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Deals en Negociación"
          value={totalOpenDeals}
          trend="+24%"
          color="amber"
          href="/pipelines"
          loading={dealsQuery.isLoading}
        />
        <StatCard
          icon={<TicketCheck className="h-5 w-5" />}
          label="Tickets Abiertos"
          value={totalOpenTickets}
          color="purple"
          href="/support/tickets"
          loading={ticketsQuery.isLoading}
        />
      </div>

      {/* Main Grid: Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-white/[0.08] bg-[#0f1420]/80 backdrop-blur-md p-6">
            <h2 className="text-sm font-semibold text-slate-100 mb-4 tracking-tight flex items-center justify-between">
              <span>Actividad y Eventos Recientes</span>
              <span className="text-[11px] font-normal text-slate-400">Tiempo real</span>
            </h2>
            {recentActivity.length === 0 && !ticketsQuery.isLoading ? (
              <p className="text-xs text-slate-400 py-12 text-center">No hay actividad reciente registrada</p>
            ) : (
              <ActivityTimeline items={recentActivity} loading={ticketsQuery.isLoading} />
            )}
          </Card>
        </div>

        <div>
          <Card className="border border-white/[0.08] bg-[#0f1420]/80 backdrop-blur-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Accesos Directos</h3>
            <div className="space-y-2">
              <Link href="/analytics/forecast" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all group">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-200">Forecasting 3M/6M</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </Link>
              <Link href="/calls" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all group">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-slate-200">Llamadas VoIP & Audio</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </Link>
              <Link href="/quotes" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all group">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-slate-200">Generador de Cotizaciones</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
export default DashboardPage
