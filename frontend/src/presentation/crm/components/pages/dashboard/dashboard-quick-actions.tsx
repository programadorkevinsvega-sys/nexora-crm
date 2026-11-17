'use client'

import React from 'react'
import Link from 'next/link'
import {
  Calendar,
  TrendingUp,
  Mail,
  MessageSquare,
  BookOpen,
  Share2,
  FileText,
  Phone,
  ArrowUpRight,
} from 'lucide-react'

export function DashboardQuickActions() {
  const actions = [
    { href: '/booking', icon: Calendar, label: 'Agendamiento & Meet', desc: 'Gestionar páginas /meet' },
    { href: '/analytics/forecast', icon: TrendingUp, label: 'Forecasting Trimestral', desc: 'Proyecciones MRR 3M/6M' },
    { href: '/campaigns/email-editor', icon: Mail, label: 'Diseñador de Emails', desc: 'Drag-and-Drop builder' },
    { href: '/inbox', icon: MessageSquare, label: 'Bandeja Omnicanal', desc: 'WhatsApp & Web chat' },
    { href: '/kb', icon: BookOpen, label: 'Base de Conocimiento', desc: 'RAG & Documentos AI' },
    { href: '/social-inbox', icon: Share2, label: 'Social Inbox & Ads', desc: 'Auto-respondedor TikTok/Meta' },
    { href: '/quotes', icon: FileText, label: 'Cotizaciones & Cobros', desc: 'Links de pago Stripe/Wompi' },
    { href: '/calls', icon: Phone, label: 'Llamadas VoIP Twilio', desc: 'Click-to-Call en navegador' },
  ]

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Centro de Operaciones & Accesos Rápidos</h2>
        <span className="text-xs text-muted-foreground">8 módulos principales</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((act, i) => {
          const Icon = act.icon
          return (
            <Link
              key={i}
              href={act.href}
              className="p-3.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-muted/50 transition-all group flex flex-col justify-between space-y-2 bg-background/50"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Icon size={16} />
                </div>
                <ArrowUpRight size={12} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>

              <div>
                <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {act.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{act.desc}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
