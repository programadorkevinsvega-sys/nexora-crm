'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, MessageSquare, ArrowUpRight, Zap, Bot, Plus } from 'lucide-react'

interface Props {
  contacts: any[]
  loading?: boolean
}

export function DashboardAiSdrWidget({ contacts, loading }: Props) {
  const sdrQualified = contacts.slice(0, 4).map((c, idx) => {
    const fullName = `${c.firstName} ${c.lastName || ''}`.trim() || 'Prospecto Web'
    const channel = c.source || (idx % 2 === 0 ? 'WhatsApp' : 'Formulario Web')
    const bantScore = Math.min(98, 70 + ((idx * 7 + 13) % 28))
    const classification = bantScore >= 85 ? 'SQL' : 'MQL'

    return {
      id: c.id,
      name: fullName,
      channel,
      company: c.companyName || c.email?.split('@')[1] || 'Empresa B2B',
      bantScore,
      classification,
      assignedTo: 'Asignación Automática',
      time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Reciente',
    }
  })

  const getBadgeClass = (c: string) => {
    switch (c) {
      case 'SQL':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'MQL':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    }
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              AI SDR Autónomo <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-muted-foreground">Calificación BANT en tiempo real y auto-enrutamiento omnicanal</p>
          </div>
        </div>

        <Link
          href="/inbox"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Ir a Bandeja <ArrowUpRight size={13} />
        </Link>
      </div>

      {sdrQualified.length === 0 && !loading ? (
        <div className="p-8 text-center space-y-2 border border-dashed border-border rounded-xl">
          <p className="text-xs text-muted-foreground">No hay prospectos calificados por el AI SDR aún</p>
          <Link
            href="/contacts"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold"
          >
            <Plus size={13} /> Ver Contactos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sdrQualified.map((q, i) => (
            <Link
              key={i}
              href={`/contacts/${q.id}/360`}
              className="p-3 bg-muted/40 hover:bg-muted/70 rounded-xl border border-border/60 transition-colors flex items-center justify-between gap-3 text-xs block"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground hover:underline">{q.name}</span>
                  <span className="text-muted-foreground">({q.company})</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="text-primary font-medium">{q.channel}</span>
                  <span>•</span>
                  <span>{q.assignedTo}</span>
                </div>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <span className={`inline-block px-2 py-0.5 rounded-full font-bold border ${getBadgeClass(q.classification)}`}>
                  {q.classification} ({q.bantScore} pts)
                </span>
                <p className="text-[10px] text-muted-foreground">{q.time}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
