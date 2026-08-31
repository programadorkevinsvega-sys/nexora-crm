"use client"

import { useQuery } from "@tanstack/react-query"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ApiAffiliateRepository, type Payout } from "@/src/infrastructure/crm/repositories/affiliates/api-affiliate.repository"

export interface PayoutTableProps {
  affiliateId?: string
  programId?: string
}

export function PayoutTable({ affiliateId, programId }: PayoutTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["affiliate-payouts", { affiliateId, programId }],
    queryFn: () =>
      ApiAffiliateRepository.listPayouts({
        ...(affiliateId ? { affiliateId } : {}),
        ...(programId ? {} : {}),
      }),
    enabled: !!(affiliateId || programId),
  })

  const columns: ColumnDef<Payout>[] = [
    {
      key: "amount",
      header: "Amount",
      render: (row) => `$${row.amount.toLocaleString()}`,
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "paidAt", header: "Paid At", render: (row) => row.paidAt ? new Date(row.paidAt).toLocaleDateString() : "—" },
    { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ]

  if (isLoading) return <Skeleton className="h-48" />

  return data && data.data.length > 0 ? (
    <DataTable columns={columns} data={data.data} />
  ) : (
    <EmptyState title="No payouts" />
  )
}
