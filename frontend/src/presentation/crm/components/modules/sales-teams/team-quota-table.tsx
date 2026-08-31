"use client"

import { useQuery } from "@tanstack/react-query"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ApiSalesTeamRepository } from "@/src/infrastructure/crm/repositories/sales-teams/api-sales-team.repository"

export interface TeamQuotaTableProps {
  teamId: string
}

export function TeamQuotaTable({ teamId }: TeamQuotaTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["team-quotas", teamId],
    queryFn: () => ApiSalesTeamRepository.listQuotas(teamId),
    enabled: !!teamId,
  })

  const columns: ColumnDef<any>[] = [
    { key: "userId", header: "User ID" },
    {
      key: "periodMonth",
      header: "Period",
      render: (row) => {
        const date = new Date(row.periodYear, row.periodMonth - 1)
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      },
    },
    {
      key: "targetAmount",
      header: "Target",
      render: (row) => `$${row.targetAmount.toLocaleString()}`,
    },
    {
      key: "achievedAmount",
      header: "Achieved",
      render: (row) => row.achievedAmount != null ? `$${row.achievedAmount.toLocaleString()}` : "—",
    },
    {
      key: "progress",
      header: "Progress",
      render: (row) => {
        if (!row.achievedAmount || !row.targetAmount) return "—"
        const pct = Math.round((row.achievedAmount / row.targetAmount) * 100)
        return `${pct}%`
      },
    },
  ]

  if (isLoading) return <Skeleton className="h-48" />

  return data && data.data.length > 0 ? (
    <DataTable columns={columns} data={data.data} />
  ) : (
    <EmptyState title="No quotas" description="No quotas defined for this team" />
  )
}
