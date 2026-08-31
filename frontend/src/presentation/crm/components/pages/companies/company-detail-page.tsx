"use client"

import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCompany, useDeleteCompany } from "@src/application/crm/di/hooks"
import { useState } from "react"

export function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const id = params.id as string

  const { data: company, isLoading, isError, error } = useCompany(id)
  const { mutate: deleteCompany } = useDeleteCompany()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!company) return <div className="text-body text-ash">Company not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={company.name}
        breadcrumb={[
          { label: "Companies", href: "/crm/companies" },
          { label: company.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/crm/companies/${id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <EntityCard title="Company Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-ash">Name</p>
                <p className="text-body text-paper">{company.name}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Tax ID (NIT / RUT)</p>
                <p className="text-body text-paper">{company.taxId ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Industry</p>
                <p className="text-body text-paper">{company.industry ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Website</p>
                <p className="text-body text-paper">{company.website ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Employees Count</p>
                <p className="text-body text-paper">{company.numberOfEmployees ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Annual Revenue</p>
                <p className="text-body text-paper">{company.annualRevenue ? `$${Number(company.annualRevenue).toLocaleString()}` : "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-caption text-ash">Description</p>
                <p className="text-body text-paper whitespace-pre-wrap">{company.description ?? "—"}</p>
              </div>
            </div>
          </EntityCard>
        </div>
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
            <div className="space-y-2 text-caption text-ash">
              <p>Created: {new Date(company.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(company.updatedAt).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete company"
        message={`Are you sure you want to delete "${company.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          deleteCompany(id)
          router.push("/crm/companies")
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default CompanyDetailPage
