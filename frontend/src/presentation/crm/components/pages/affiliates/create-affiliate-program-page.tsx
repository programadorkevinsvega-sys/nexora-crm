"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { ApiAffiliateRepository } from "@/src/infrastructure/crm/repositories/affiliates/api-affiliate.repository"
import { useAuth } from "@/src/presentation/hooks/use-auth"

export function CreateAffiliateProgramPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const tid = tenantId || "00000000-0000-0000-0000-000000000001"

  const [name, setName] = useState("")
  const [commissionType, setCommissionType] = useState("PERCENTAGE")
  const [commissionRate, setCommissionRate] = useState(15)
  const [cookieDays, setCookieDays] = useState(30)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError("")
    try {
      await ApiAffiliateRepository.createProgram({
        tenantId: tid,
        name: name.trim(),
        commissionType,
        commissionRate: Number(commissionRate),
        cookieDays: Number(cookieDays),
        isActive,
      })
      router.push("/affiliates/programs")
    } catch (err: any) {
      setError(err?.message || "Error al crear el programa de afiliados")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/affiliates/programs")}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a Programas
      </Button>

      <PageHeader
        title="Crear Nuevo Programa de Afiliados"
        description="Define las reglas de comisiones, duración de cookies y condiciones para tus socios comerciales."
      />

      <Card className="p-6 border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre del Programa *</label>
            <input
              type="text"
              required
              placeholder="Ej: Programa Embajadores SaaS 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Tipo de Comisión</label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                {commissionType === "PERCENTAGE" ? "Porcentaje de Comisión (%)" : "Monto por Venta ($)"}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full p-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Duración de Cookie de Atribución (Días)</label>
            <input
              type="number"
              min="1"
              max="365"
              required
              value={cookieDays}
              onChange={(e) => setCookieDays(Number(e.target.value))}
              className="w-full p-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Días en los que se le atribuirá la venta al afiliado tras el clic del cliente.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-xs font-medium cursor-pointer">
              Activar programa inmediatamente para nuevos afiliados
            </label>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              ⚠️ {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="ghost" onClick={() => router.push("/affiliates/programs")} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Guardando..." : <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Crear Programa</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateAffiliateProgramPage
