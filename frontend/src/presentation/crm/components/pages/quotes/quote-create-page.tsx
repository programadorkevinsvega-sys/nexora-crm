"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Select } from "@/src/presentation/crm/components/ui/Select"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCreateQuote } from "@src/application/crm/di/hooks"
import { ApiTenantConfigRepository } from "@/src/infrastructure/crm/repositories/tenant/api-tenant-config.repository"
import type { TenantTax, TenantCurrency } from "@crm/contracts"

export function CreateQuotePage() {
  const router = useRouter()
  const { tenantId } = useAuth()

  const [quoteNumber, setQuoteNumber] = useState(`QT-${Date.now().toString().slice(-6)}`)
  const [dealId, setDealId] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [selectedTaxId, setSelectedTaxId] = useState("")
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [subtotal, setSubtotal] = useState("0")
  const [taxTotal, setTaxTotal] = useState("0")
  const [grandTotal, setGrandTotal] = useState("0")
  const [termsAndConditions, setTermsAndConditions] = useState("")

  const [taxes, setTaxes] = useState<TenantTax[]>([])
  const [currencies, setCurrencies] = useState<TenantCurrency[]>([])

  useEffect(() => {
    ApiTenantConfigRepository.listTaxes().then((res) => {
      setTaxes(res || [])
      if (res && res.length > 0) setSelectedTaxId(res[0].id)
    }).catch(() => {})
    ApiTenantConfigRepository.listCurrencies().then((res) => {
      setCurrencies(res || [])
    }).catch(() => {})
  }, [])

  const { mutate: createQuote, isPending: isCreating } = useCreateQuote()

  const handleSubtotalChange = (val: string, taxId = selectedTaxId) => {
    setSubtotal(val)
    const numSub = parseFloat(val) || 0
    const taxObj = taxes.find((t) => t.id === taxId)
    const taxRate = taxObj ? taxObj.taxPercentage / 100 : 0.19
    const computedTax = Number((numSub * taxRate).toFixed(2))
    setTaxTotal(computedTax.toString())
    setGrandTotal((numSub + computedTax).toFixed(2))
  }

  const handleTaxSelect = (taxId: string) => {
    setSelectedTaxId(taxId)
    handleSubtotalChange(subtotal, taxId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createQuote(
      {
        tenantId: tenantId!,
        quoteNumber,
        dealId: dealId || null,
        validUntil,
        subtotal: parseFloat(subtotal) || 0,
        taxTotal: parseFloat(taxTotal) || 0,
        grandTotal: parseFloat(grandTotal) || 0,
        termsAndConditions: termsAndConditions || null,
      },
      {
        onSuccess: () => router.push("/quotes"),
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Crear Cotización CPQ"
        breadcrumb={[
          { label: "Cotizaciones", href: "/quotes" },
          { label: "Nueva Cotización" },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-4 bg-card border border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-foreground font-medium">Nº Cotización *</label>
              <Input value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-foreground font-medium">Moneda</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {currencies.length > 0 ? (
                  currencies.map((c) => (
                    <option key={c.id} value={c.isoCode}>{c.name} ({c.symbol})</option>
                  ))
                ) : (
                  <option value="USD">USD ($)</option>
                )}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-caption text-foreground font-medium">Válida Hasta *</label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-foreground font-medium">Subtotal ({currency})</label>
              <Input type="number" step="0.01" value={subtotal} onChange={(e) => handleSubtotalChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-foreground font-medium">Régimen Fiscal / Impuesto</label>
              <Select value={selectedTaxId} onChange={(e) => handleTaxSelect(e.target.value)}>
                {taxes.map((t) => (
                  <option key={t.id} value={t.id}>{t.taxName} ({t.taxPercentage}%)</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-caption text-foreground font-medium">Total Impuesto ({currency})</label>
              <Input type="number" step="0.01" value={taxTotal} readOnly className="bg-muted/50" />
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground">Total General Facturable:</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{currency} ${grandTotal}</span>
          </div>

          <div className="space-y-2">
            <label className="text-caption text-foreground font-medium">Términos Comerciales & Forma de Pago</label>
            <textarea
              className="h-20 w-full rounded-md bg-muted px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="30 días netos, transferencia bancaria..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={!quoteNumber || isCreating} className="bg-cyan-600 hover:bg-cyan-500 text-white">
              {isCreating ? "Guardando..." : "Crear Cotización"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
export default CreateQuotePage
