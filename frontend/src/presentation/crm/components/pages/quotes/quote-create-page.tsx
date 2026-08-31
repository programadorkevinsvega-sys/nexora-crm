"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCreateQuote } from "@src/application/crm/di/hooks"

export function CreateQuotePage() {
  const router = useRouter()
  const { tenantId } = useAuth()

  const [quoteNumber, setQuoteNumber] = useState(`QT-${Date.now().toString().slice(-6)}`)
  const [dealId, setDealId] = useState("")
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [subtotal, setSubtotal] = useState("0")
  const [taxTotal, setTaxTotal] = useState("0")
  const [grandTotal, setGrandTotal] = useState("0")
  const [termsAndConditions, setTermsAndConditions] = useState("")

  const { mutate: createQuote, isPending: isCreating } = useCreateQuote()

  const handleSubtotalChange = (val: string) => {
    setSubtotal(val)
    const numSub = parseFloat(val) || 0
    const numTax = parseFloat(taxTotal) || 0
    setGrandTotal((numSub + numTax).toString())
  }

  const handleTaxChange = (val: string) => {
    setTaxTotal(val)
    const numSub = parseFloat(subtotal) || 0
    const numTax = parseFloat(val) || 0
    setGrandTotal((numSub + numTax).toString())
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
        title="Create Quote"
        breadcrumb={[
          { label: "Quotes", href: "/quotes" },
          { label: "Create Quote" },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Quote Number *</label>
              <Input
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                placeholder="QT-0001"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Valid Until *</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Subtotal ($)</label>
              <Input
                type="number"
                step="0.01"
                value={subtotal}
                onChange={(e) => handleSubtotalChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Tax ($)</label>
              <Input
                type="number"
                step="0.01"
                value={taxTotal}
                onChange={(e) => handleTaxChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-ash font-medium">Grand Total ($)</label>
              <Input
                type="number"
                step="0.01"
                value={grandTotal}
                onChange={(e) => setGrandTotal(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Terms & Conditions</label>
            <textarea
              className="h-24 w-full rounded-inputs bg-graphite px-3 py-2 text-sm text-foreground placeholder:text-ash rekki-inset focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="Payment terms, delivery conditions, etc."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={!quoteNumber || isCreating}>
              {isCreating ? "Creating..." : "Create Quote"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
export default CreateQuotePage
