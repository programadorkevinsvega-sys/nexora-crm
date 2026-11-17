"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, GitFork, Building2, Phone, Mail, MapPin, Globe, ExternalLink, HeartPulse } from "lucide-react"
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
        breadcrumb={[{ label: "Empresas", href: "/companies" }, { label: company.name }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/companies/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1.5" /> Editar
            </Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Eliminar
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("org-chart")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition ${
            activeTab === "org-chart" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitFork className="h-4 w-4" /> <span>Organigrama & Jerarquía</span>
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition ${
            activeTab === "info" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" /> <span>Información Enterprise</span>
        </button>
      </div>

      {activeTab === "org-chart" && <CompanyOrgChart companyId={id} companyName={company.name} />}

      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EntityCard title="Perfil Corporativo Enterprise">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-muted-foreground">Razón Social</p>
                  <p className="text-body font-semibold text-foreground">{company.name}</p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">NIT / RUT / Tax ID</p>
                  <p className="text-body font-mono text-foreground">{company.taxId ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Sector / Industria</p>
                  <p className="text-body text-foreground">{company.industry ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Nivel / Tier VIP</p>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {company.tier || "TIER_2"}
                  </span>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Etapa del Cliente</p>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400">
                    {company.lifecycleStage || "PROSPECT"}
                  </span>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Salud de Cuenta (Health Score)</p>
                  <p className="text-body font-bold text-emerald-400 flex items-center gap-1">
                    <HeartPulse className="h-4 w-4" /> {company.healthScore ?? 100} / 100
                  </p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Total Empleados</p>
                  <p className="text-body text-foreground">{company.numberOfEmployees ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Facturación Anual (ARR)</p>
                  <p className="text-body font-semibold text-emerald-400">
                    {company.annualRevenue ? `$${Number(company.annualRevenue).toLocaleString()} USD` : "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-caption text-muted-foreground">Descripción Corporativa</p>
                  <p className="text-body text-foreground whitespace-pre-wrap">{company.description ?? "—"}</p>
                </div>
              </div>
            </EntityCard>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-card border border-border space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Canales de Contacto & Ubicación</h3>
              <div className="space-y-2 text-xs text-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{company.phone || "Sin PBX registrado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{company.email || "Sin email corporativo"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{[company.address, company.city, company.country].filter(Boolean).join(", ") || "Global"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  {company.website ? <a href={company.website} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{company.website}</a> : <span>—</span>}
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
                  {company.linkedinUrl ? <a href={company.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Perfil LinkedIn</a> : <span>—</span>}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Metadatos de Registro</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
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
        onConfirm={() => { deleteCompany(id); router.push("/companies") }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default CompanyDetailPage
