"use client"

import { useQuery } from "@tanstack/react-query"
import { Building2, Users, TrendingUp, TicketCheck } from "lucide-react"
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
  loading?: boolean
}

function StatCard({ icon, label, value, loading }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-cards)] bg-iron text-signal-blue">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-caption text-ash">{label}</p>
        {loading ? (
          <Skeleton className="h-6 w-16" />
        ) : (
          <p className="text-heading font-sans font-bold text-paper">{value}</p>
        )}
      </div>
    </Card>
  )
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
      content: `Company "${c.name}" was created`,
      date: new Date(c.createdAt).toLocaleDateString(),
      author: "System",
    })),
    ...(ticketsQuery.data?.data ?? []).map((t: any) => ({
      id: `ticket-${t.id}`,
      type: "note" as const,
      content: `Ticket "${t.subject}" opened`,
      date: new Date(t.createdAt).toLocaleDateString(),
      author: "System",
    })),
  ]

  if (isAnyError) return <ErrorState message={(queryError as Error)?.message} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading font-sans font-bold text-paper">Dashboard</h1>
        <p className="text-body text-ash mt-1">Overview of your CRM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 className="h-6 w-6" />}
          label="Total Companies"
          value={totalCompanies}
          loading={companiesQuery.isLoading}
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Total Contacts"
          value={totalContacts}
          loading={contactsQuery.isLoading}
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Open Deals"
          value={totalOpenDeals}
          loading={dealsQuery.isLoading}
        />
        <StatCard
          icon={<TicketCheck className="h-6 w-6" />}
          label="Open Tickets"
          value={totalOpenTickets}
          loading={ticketsQuery.isLoading}
        />
      </div>

      <Card className="p-4">
        <h2 className="text-heading-sm font-sans font-semibold text-paper mb-4">Recent Activity</h2>
        {recentActivity.length === 0 && !ticketsQuery.isLoading ? (
          <p className="text-body text-ash py-8 text-center">No recent activity</p>
        ) : (
          <ActivityTimeline items={recentActivity} loading={ticketsQuery.isLoading} />
        )}
      </Card>
    </div>
  )
}
export default DashboardPage
