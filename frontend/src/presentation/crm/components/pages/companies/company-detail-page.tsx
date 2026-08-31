"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, GitFork, Building2, Users } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useCompany, useDeleteCompany } from "@src/application/crm/di/hooks"
import { CompanyOrgChart } from "./org-chart/company-org-chart"

type TabType = "org-chart" | "info"

export function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("org-chart")
  const id = params.id as string

  const { data: company, isLoading, isError, error } = useCompany(id)
  const { mutate: deleteCompany } = useDeleteCompany()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!company) return <div className="text-body text-ash">Empresa no encontrada</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={company.name}
        breadcrumb={[
          { label: "Empresas", href: "/crm/companies" },
          { label: company.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/crm/companies/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Editar
            </Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Eliminar
            </Button>
          </div>
        }
      />

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab("org-chart")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition ${
            activeTab === "org-chart"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
          }`}
        >
          <GitFork className="h-4 w-4 text-cyan-400" />
          <span>Organigrama & Jerarquía</span>
        </button>

        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition ${
            activeTab === "info"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Información de Empresa</span>
        </button>
      </div>

      {/* Tab: Organigrama Interactivo */}
      {activeTab === "org-chart" && (
        <CompanyOrgChart companyId={id} companyName={company.name} />
      )}

      {/* Tab: Información General */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EntityCard title="Información Corporativa">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-ash">Razón Social</p>
                  <p className="text-body text-paper">{company.name}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">NIT / RUT / Tax ID</p>
                  <p className="text-body text-paper">{company.taxId ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Sector / Industria</p>
                  <p className="text-body text-paper">{company.industry ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Sitio Web</p>
                  <p className="text-body text-paper">{company.website ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Total Empleados</p>
                  <p className="text-body text-paper">{company.numberOfEmployees ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Ingresos Anuales (ARR)</p>
                  <p className="text-body text-paper">
                    {company.annualRevenue ? `$${Number(company.annualRevenue).toLocaleString()} USD` : "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-caption text-ash">Descripción Corporativa</p>
                  <p className="text-body text-paper whitespace-pre-wrap">{company.description ?? "—"}</p>
                </div>
              </div>
            </EntityCard>
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadatos de Registro</h3>
              <div className="space-y-2 text-caption text-ash">
                <p>Fecha Creación: {new Date(company.createdAt).toLocaleDateString()}</p>
                <p>Última Actualización: {new Date(company.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        title="Eliminar empresa"
        message={`¿Estás seguro de que deseas eliminar permanentemente a "${company.name}"?`}
        confirmLabel="Eliminar"
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
