'use client'

import React, { useState, useEffect } from 'react'
import { ApiQuotesApprovalRepository } from '@src/infrastructure/crm/repositories/quotes-approval/api-quotes-approval.repository'
import type { CustomerQuoteAcceptance } from '@crm/contracts'
import { FileText, CheckCircle2, XCircle, ShieldCheck, PenTool, Sparkles } from 'lucide-react'

interface Props {
  token: string
}

export function PublicQuoteAcceptPage({ token }: Props) {
  const [quote, setQuote] = useState<CustomerQuoteAcceptance | null>(null)
  const [loading, setLoading] = useState(true)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [statusAction, setStatusAction] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED')

  useEffect(() => {
    ApiQuotesApprovalRepository.getPublicQuote(token)
      .then(setQuote)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signerName || !signerEmail) return

    try {
      const res = await ApiQuotesApprovalRepository.submitPublicAcceptance(token, {
        status: statusAction,
        clientSignerName: signerName,
        clientSignerEmail: signerEmail,
        feedback,
      })
      setQuote(res)
      setSubmitted(true)
    } catch (err: any) {
      alert(err.message || 'Error al procesar la firma')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-sm">Cargando propuesta comercial...</div>
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-card p-8 rounded-2xl border border-border text-center space-y-3 max-w-md">
          <XCircle size={32} className="mx-auto text-rose-500" />
          <h2 className="text-base font-bold text-foreground">Enlace No Válido o Expirado</h2>
          <p className="text-xs text-muted-foreground">La cotización solicitada no existe o ya no se encuentra disponible.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-xl rounded-3xl border border-border p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Propuesta Comercial & Cotización</h1>
              <p className="text-xs text-muted-foreground">Portal de Aceptación y Firma Digital del Cliente</p>
            </div>
          </div>
          <ShieldCheck size={20} className="text-emerald-500" />
        </div>

        {quote.status === 'ACCEPTED' || submitted ? (
          <div className="p-8 text-center bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-3">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <h2 className="text-lg font-bold text-foreground">¡Propuesta Comercial Aceptada con Éxito!</h2>
            <p className="text-xs text-muted-foreground">
              Firmado digitalmente por <strong>{quote.clientSignerName || signerName}</strong> ({quote.clientSignerEmail || signerEmail}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="font-bold text-foreground block mb-1">Nombre Completo del Firmante Autorizado</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Correo Electrónico Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="juan.perez@empresa.com"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Comentarios / Instrucciones de Facturación</label>
                <textarea
                  rows={2}
                  placeholder="Aprobado conforme a los términos y condiciones acordados..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                onClick={() => setStatusAction('ACCEPTED')}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm"
              >
                <PenTool size={16} /> Firmar y Aceptar Propuesta
              </button>
              <button
                type="submit"
                onClick={() => setStatusAction('REJECTED')}
                className="px-5 py-3 bg-muted text-muted-foreground font-bold rounded-xl hover:bg-muted/80"
              >
                Rechazar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default PublicQuoteAcceptPage
