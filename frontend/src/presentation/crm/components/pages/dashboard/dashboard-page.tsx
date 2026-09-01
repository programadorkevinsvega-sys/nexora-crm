"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Building2, Users, TrendingUp, TicketCheck, ArrowUpRight, Plus, Phone, FileText } from "lucide-react"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ActivityTimeline } from "@/src/presentation/crm/components/common/ActivityTimeline"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { container } from "@src/application/crm/di/container"
import { DI_TOKENS } from "@src/application/crm/di/tokens"

const resolveRepo = <T,>(token: symbol) => container.resolve<T>(token)

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: string
  loading?: boolean
  href?: string
}

function StatCard({ icon: Icon, label, value, trend, loading, href }: StatCardProps) {
  const content = (
    <div className="bg-card rounded-[12px] p-5 border border-border hover:bg-accent transition-colors group shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-muted border border-border">
          <Icon size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        {trend && (
          <span className="text-[11px] font-[510] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-[4px]">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[12px] text-muted-foreground mb-1">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <p className="text-[24px] font-[510] text-foreground" style={{ letterSpacing: "-0.288px" }}>{value}</p>
      )}
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
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

  const isAnyError = companiesQuery.isError || contactsQuery.isError || dealsQuery.isError || ticketsQuery.isError
  const queryError = companiesQuery.error || contactsQuery.error || dealsQuery.error || ticketsQuery.error

  const recentActivity = [
    ...(companiesQuery.data?.data ?? []).map((c: any) => ({
      id: `company-${c.id}`, type: "system" as const,
      content: `Empresa "${c.name}" creada`, date: new Date(c.createdAt).toLocaleDateString(), author: "Sistema",
    })),
    ...(ticketsQuery.data?.data ?? []).map((t: any) => ({
      id: `ticket-${t.id}`, type: "note" as const,
      content: `Ticket "${t.subject}" recibido`, date: new Date(t.createdAt).toLocaleDateString(), author: "Soporte",
    })),
  ]

  if (isAnyError) return <ErrorState message={(queryError as Error)?.message} />

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-[20px] font-[510] text-foreground" style={{ letterSpacing: "-0.24px" }}>
            Panel de Control
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Resumen ejecutivo de tu operación comercial</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/contacts" className="flex items-center gap-1.5 px-3 h-7 text-[13px] font-[400] text-muted-foreground hover:text-foreground border border-border hover:bg-muted rounded-[6px] transition-colors">
            <Plus size={13} /> Contacto
          </Link>
          <Link href="/pipelines/deals/new" className="flex items-center gap-1.5 px-3 h-7 text-[13px] font-[510] text-primary-foreground bg-primary hover:opacity-90 rounded-[6px] transition-colors tracking-[-0.011em]">
            <Plus size={13} /> Oportunidad
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Empresas" value={companiesQuery.data?.data.length ?? 0} trend="+12%" href="/companies" loading={companiesQuery.isLoading} />
        <StatCard icon={Users} label="Contactos & Leads" value={contactsQuery.data?.data.length ?? 0} trend="+8%" href="/contacts" loading={contactsQuery.isLoading} />
        <StatCard icon={TrendingUp} label="Deals en Negociación" value={dealsQuery.data?.data.length ?? 0} trend="+24%" href="/pipelines" loading={dealsQuery.isLoading} />
        <StatCard icon={TicketCheck} label="Tickets Abiertos" value={ticketsQuery.data?.data.length ?? 0} href="/support/tickets" loading={ticketsQuery.isLoading} />
      </div>

      {/* Activity + Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-[12px] p-6 border border-border shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[14px] font-[510] text-foreground">Actividad Reciente</h2>
            <span className="text-[11px] text-muted-foreground font-mono">En vivo</span>
          </div>
          {recentActivity.length === 0 && !ticketsQuery.isLoading ? (
            <p className="text-[13px] text-muted-foreground py-10 text-center">No hay actividad reciente registrada</p>
          ) : (
            <ActivityTimeline items={recentActivity} loading={ticketsQuery.isLoading} />
          )}
        </div>

        <div className="bg-card rounded-[12px] p-6 border border-border shadow-xs space-y-3">
          <h3 className="text-[14px] font-[510] text-foreground mb-4">Accesos Directos</h3>
          {[
            { href: "/analytics/forecast", icon: TrendingUp, label: "Forecasting 3M / 6M" },
            { href: "/calls", icon: Phone, label: "Llamadas VoIP" },
            { href: "/quotes", icon: FileText, label: "Cotizaciones CPQ" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex items-center justify-between p-3 rounded-[6px] hover:bg-muted/60 transition-colors group border border-transparent hover:border-border">
              <div className="flex items-center gap-2.5">
                <Icon size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
              </div>
              <ArrowUpRight size={12} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
export default DashboardPage
