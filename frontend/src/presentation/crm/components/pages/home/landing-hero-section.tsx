"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp, Shield, Zap, Users } from "lucide-react"

const metrics = [
  { value: "+38%", label: "Conversión de Oportunidades", icon: TrendingUp },
  { value: "99.99%", label: "Disponibilidad SLA", icon: Shield },
  { value: "< 20ms", label: "Latencia Global", icon: Zap },
  { value: "Multi-Tenant", label: "Aislamiento por Empresa", icon: Users },
]

export function LandingHeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-background">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Eyebrow label */}
        <p className="text-[12px] font-[510] text-muted-foreground uppercase tracking-[0.08em] mb-4">
          Nexora Enterprise CRM
        </p>

        {/* Main headline */}
        <h1
          className="text-[40px] sm:text-[54px] lg:text-[62px] font-[510] text-foreground max-w-4xl leading-[1.05] mb-6 tracking-tight"
        >
          La plataforma para cerrar más ventas y retener más clientes.
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] font-[400] text-muted-foreground max-w-2xl leading-[1.6] mb-8">
          Prospección omnicanal, telefonía VoIP, cotizaciones CPQ con firma legal, helpdesk con SLA y copiloto IA — todo en una sola suite empresarial.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start gap-3 mb-12">
          <Link
            href="/login?redirect=/crm"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-[510] tracking-[-0.011em] text-primary-foreground bg-primary hover:opacity-90 rounded-[8px] transition-all shadow-xs"
          >
            Explorar demo interactiva
            <ArrowRight size={14} />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-[400] text-foreground bg-card border border-border hover:bg-muted rounded-[8px] transition-colors"
          >
            Ver ecosistema completo
          </a>
        </div>

        {/* Demo credentials banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground font-mono mb-12">
          <span>Demo:</span>
          <span className="font-semibold text-foreground">demo@nexoracrm.com</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Password123!</span>
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-border rounded-xl overflow-hidden bg-border shadow-xs">
          {metrics.map(({ value, label, icon: Icon }) => (
            <div key={label} className="bg-card px-6 py-5">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="text-muted-foreground" />
                <span className="text-[20px] font-[510] text-foreground tracking-tight">
                  {value}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
