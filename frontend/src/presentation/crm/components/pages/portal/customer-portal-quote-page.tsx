"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck, XCircle } from "lucide-react"
import { api } from "@/src/infrastructure/crm/api/api-client"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"

interface PortalQuote {
  id: string
  dealId: string
  dealName: string
  quoteNumber: string
  status: string
  validUntil: string
  isExpired: boolean
  termsAndConditions: string | null
  subtotal: number
  taxTotal: number
  grandTotal: number
  currency: string
  createdAt: string
  updatedAt: string
}

export function CustomerPortalQuotePage({ quoteId }: { quoteId: string }) {
  const [quote, setQuote] = useState<PortalQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [acceptedAuthority, setAcceptedAuthority] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showReject, setShowReject] = useState(false)
  const [error, setError] = useState("")

  const loadQuote = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setQuote(await api.get<PortalQuote>(`/api/customer-portal/quotes/${quoteId}`))
    } catch (loadError) {
      setQuote(null)
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la cotización.")
    } finally {
      setLoading(false)
    }
  }, [quoteId])

  useEffect(() => { void loadQuote() }, [loadQuote])

  const acceptQuote = async () => {
    if (!acceptedAuthority || submitting) return
    setSubmitting(true)
    setError("")
    try {
      setQuote(await api.post<PortalQuote>(`/api/customer-portal/quotes/${quoteId}/accept`, {}))
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo aceptar la cotización.")
    } finally {
      setSubmitting(false)
    }
  }

  const rejectQuote = async () => {
    if (rejectionReason.trim().length < 10 || submitting) return
    setSubmitting(true)
    setError("")
    try {
      setQuote(await api.post<PortalQuote>(`/api/customer-portal/quotes/${quoteId}/reject`, {
        reason: rejectionReason.trim(),
      }))
      setShowReject(false)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo rechazar la cotización.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatMoney = (amount: number) => {
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: quote?.currency || "USD",
        maximumFractionDigits: 2,
      }).format(Number(amount) || 0)
    } catch {
      return `${quote?.currency || "USD"} ${Number(amount || 0).toLocaleString("es-CO")}`
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4 space-y-4"><Skeleton className="h-10 w-52" /><Skeleton className="h-64 w-full" /><Skeleton className="h-36 w-full" /></div>
  }

  if (!quote) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Card className="p-8 space-y-3">
          <h1 className="text-lg font-bold">Cotización no disponible</h1>
          <p className="text-sm text-muted-foreground">{error || "La cotización no existe o no pertenece a tu cuenta."}</p>
          <Link href="/portal" className="text-sm text-primary underline">Volver al portal</Link>
        </Card>
      </div>
    )
  }

  const canDecide = quote.status === "SENT" && !quote.isExpired

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-5 pb-12">
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al portal
      </Link>

      <Card className="p-6 md:p-8 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="h-4 w-4" /> Cotización comercial</div>
            <h1 className="text-2xl font-bold">{quote.quoteNumber}</h1>
            <p className="text-sm text-muted-foreground">{quote.dealName}</p>
          </div>
          <Badge variant={quote.status === "ACCEPTED" ? "secondary" : "outline"}>{quote.status}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y py-4 text-sm">
          <div><p className="text-xs text-muted-foreground">Vigencia hasta</p><p className="font-medium">{new Date(quote.validUntil).toLocaleDateString("es-CO", { timeZone: "UTC" })}</p></div>
          <div><p className="text-xs text-muted-foreground">Fecha de emisión</p><p className="font-medium">{new Date(quote.createdAt).toLocaleDateString("es-CO")}</p></div>
        </div>

        <div className="space-y-3 max-w-md ml-auto w-full">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(quote.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Impuestos</span><span>{formatMoney(quote.taxTotal)}</span></div>
          <div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total</span><span>{formatMoney(quote.grandTotal)}</span></div>
        </div>

        {quote.termsAndConditions && (
          <div className="border-t pt-4 space-y-2">
            <h2 className="font-semibold text-sm">Términos y condiciones</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{quote.termsAndConditions}</p>
          </div>
        )}
      </Card>

      {quote.status === "ACCEPTED" && (
        <Card className="p-5 flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /><div><h2 className="font-semibold">Cotización aceptada</h2><p className="text-sm text-muted-foreground mt-1">La aceptación comercial quedó registrada.</p></div></Card>
      )}
      {quote.status === "REJECTED" && (
        <Card className="p-5 flex items-start gap-3"><XCircle className="h-5 w-5 text-muted-foreground shrink-0" /><div><h2 className="font-semibold">Cotización rechazada</h2><p className="text-sm text-muted-foreground mt-1">La decisión quedó registrada y se notificará al equipo comercial.</p></div></Card>
      )}
      {quote.isExpired && quote.status === "SENT" && (
        <Card className="p-5"><h2 className="font-semibold">Cotización vencida</h2><p className="text-sm text-muted-foreground mt-1">La fecha de vigencia terminó. Contacta al equipo comercial para solicitar una propuesta actualizada.</p></Card>
      )}

      {canDecide && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="font-semibold">Tu decisión</h2></div>
          <p className="text-sm text-muted-foreground">La aceptación o el rechazo se registrará con la identidad de tu cuenta del portal.</p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={acceptedAuthority} onChange={(event) => setAcceptedAuthority(event.target.checked)} className="mt-1" />
            Confirmo que tengo autorización para aceptar esta cotización en nombre de mi organización.
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={acceptQuote} disabled={!acceptedAuthority || submitting}>{submitting ? "Procesando..." : "Aceptar cotización"}</Button>
            <Button variant="outline" onClick={() => setShowReject((value) => !value)} disabled={submitting}>Rechazar</Button>
          </div>
          {showReject && (
            <div className="space-y-2 border-t pt-4">
              <label htmlFor="quote-rejection-reason" className="text-sm font-medium">Motivo del rechazo</label>
              <textarea id="quote-rejection-reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={3} maxLength={2000} className="w-full rounded-md border bg-background p-3 text-sm" placeholder="Indica por qué no puedes aceptar esta propuesta..." />
              <Button variant="outline" onClick={rejectQuote} disabled={submitting || rejectionReason.trim().length < 10}>Confirmar rechazo</Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Esta acción registra una decisión comercial y no sustituye una firma electrónica ni una verificación OTP cuando estas sean necesarias.</p>
        </Card>
      )}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
