"use client"

import { useCallback, useState } from "react"
import { Plus, Handshake, CheckCircle2, Copy } from "lucide-react"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { FilterBar } from "@/src/presentation/crm/components/common/FilterBar"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePaginatedList } from "@/src/presentation/hooks/use-paginated-list"
import { useAffiliatesList, useProgramsList } from "@src/application/crm/di/hooks"
import { ApiAffiliateRepository } from "@/src/infrastructure/crm/repositories/affiliates/api-affiliate.repository"
import type { Affiliate } from "@/src/domain/crm/affiliates/affiliate.entity"
import { useQueryClient } from "@tanstack/react-query"

export function AffiliateListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const tid = tenantId || "00000000-0000-0000-0000-000000000001"
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  // Registration modal state
  const [showRegister, setShowRegister] = useState(false)
  const [selectedProgramId, setSelectedProgramId] = useState("")
  const [contactId, setContactId] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const programsResult = useProgramsList({ tenantId: tid })
  const programs = programsResult.data?.data || []

  const queryResult = useAffiliatesList({ tenantId: tid, search, cursor, ...filters })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore, reset } = usePaginatedList<Affiliate>(queryResult, cursor, setCursor)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    reset()
  }, [reset])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    reset()
  }, [reset])

  const handleOpenRegister = () => {
    const randomCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setReferralCode(randomCode)
    setContactId(crypto.randomUUID())
    if (programs.length > 0) setSelectedProgramId(programs[0].id)
    setShowRegister(true)
  }

  const handleRegisterAffiliate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralCode.trim()) return
    setSaving(true)
    setErrorMsg("")
    try {
      await ApiAffiliateRepository.createAffiliate({
        tenantId: tid,
        programId: selectedProgramId || (programs[0]?.id ?? crypto.randomUUID()),
        contactId: contactId || crypto.randomUUID(),
        referralCode: referralCode.trim().toUpperCase(),
      })
      setShowRegister(false)
      queryClient.invalidateQueries({ queryKey: ["affiliates"] })
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al registrar afiliado")
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnDef<Affiliate>[] = [
    {
      key: "referralCode",
      header: "Código de Afiliado",
      render: (row) => (
        <span className="font-mono font-semibold text-primary flex items-center gap-1.5">
          <Handshake className="h-3.5 w-3.5" />
          {row.referralCode}
        </span>
      ),
    },
    { key: "status", header: "Estado", render: (row) => <StatusBadge status={row.status} /> },
    { key: "createdAt", header: "Fecha de Registro", render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ]

  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <PageHeader
        title="Red de Afiliados & Embajadores"
        description="Gestiona tus socios comerciales, enlaces de referencia y comisiones generadas por ventas."
        actions={
          <Button onClick={handleOpenRegister}>
            <Plus className="h-4 w-4 mr-1.5" /> Registrar Afiliado
          </Button>
        }
      />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Buscar por código de referido..." />
      <FilterBar
        filters={[
          {
            key: "status",
            label: "Estado",
            options: [
              { value: "ACTIVE", label: "Activo" },
              { value: "INACTIVE", label: "Inactivo" },
              { value: "BLOCKED", label: "Bloqueado" },
            ],
          },
        ]}
        values={filters}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          nextCursor={nextCursor}
          onLoadMore={loadMore}
          loadingMore={isLoadingMore}
          onRowClick={(row) => router.push(`/affiliates/${row.id}`)}
        />
      ) : (
        <EmptyState
          title="No hay afiliados registrados"
          description="Comienza registrando tu primer afiliado o generando un enlace de invitación."
          action={
            <Button size="sm" onClick={handleOpenRegister}>
              <Plus className="h-4 w-4 mr-1.5" /> Registrar Primer Afiliado
            </Button>
          }
        />
      )}

      {/* Register Affiliate Modal */}
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="🤝 Registrar Nuevo Afiliado">
        <form onSubmit={handleRegisterAffiliate} className="space-y-4 min-w-[380px]">
          <div>
            <label className="block text-xs font-medium mb-1">Programa de Afiliados</label>
            {programs.length > 0 ? (
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full p-2 border rounded-md bg-background text-xs"
              >
                {programs.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.commissionRate}% {p.commissionType === "PERCENTAGE" ? "comisión" : "$"})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2 rounded-md">
                No hay programas creados. Puedes crear uno en Programas de Afiliados.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Código Único de Referencia *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="EJ: SOCIO-2026"
                className="w-full p-2 border rounded-md bg-background text-xs font-mono font-bold"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setReferralCode(`REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)}
              >
                Generar
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              El enlace del afiliado será: <span className="font-mono text-primary">nexora.com/?ref={referralCode || "CODIGO"}</span>
            </p>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowRegister(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving || !referralCode.trim()}>
              {saving ? "Registrando..." : "Registrar Afiliado"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AffiliateListPage
