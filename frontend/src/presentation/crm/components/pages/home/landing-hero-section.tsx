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
    <section className="relative pt-36 pb-24 overflow-hidden bg-[#08090a]">
      {/* Atmospheric gradient floor — only allowed gradient per Linear spec */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(208,214,224,0.03) 0%, transparent 100%)" }}
      />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Eyebrow label */}
        <p className="text-[12px] font-[510] text-[#62666d] uppercase tracking-[0.08em] mb-6">
          Nexora Enterprise CRM
        </p>

        {/* Main headline — Linear display scale: 64px / 510 / -1.408px */}
        <h1
          className="text-[48px] sm:text-[56px] lg:text-[64px] font-[510] text-[#ffffff] max-w-4xl leading-[1.0] mb-6"
          style={{ letterSpacing: "-1.408px" }}
        >
          La plataforma para cerrar más ventas y retener más clientes.
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] font-[400] text-[#8a8f98] max-w-2xl leading-[1.6] mb-10">
          Prospección omnicanal, telefonía VoIP, cotizaciones CPQ con firma legal, helpdesk con SLA y copiloto IA — todo en una sola suite empresarial.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start gap-3 mb-16">
          <Link
            href="/login?redirect=/crm"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-[510] tracking-[-0.011em] text-[#08090a] bg-[#e4f222] hover:bg-[#edf755] rounded-[6px] transition-colors shadow-[rgba(0,0,0,0.07)_0px_1px_1px_0px,rgba(0,0,0,0.08)_0px_0px_1px_0px]"
          >
            Explorar demo interactiva
            <ArrowRight size={14} />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-[400] text-[#d0d6e0] border border-[#23252a] hover:bg-[rgba(255,255,255,0.03)] rounded-[6px] transition-colors"
          >
            Ver ecosistema completo
          </a>
        </div>

        {/* Demo credentials */}
        <p className="text-[12px] text-[#62666d] font-mono mb-16">
          Demo: <span className="text-[#8a8f98]">demo@nexoracrm.com</span> / <span className="text-[#8a8f98]">Password123!</span>
        </p>

        {/* Metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-[#23252a] rounded-[12px] overflow-hidden bg-[#23252a]">
          {metrics.map(({ value, label, icon: Icon }) => (
            <div key={label} className="bg-[#0f1011] px-6 py-5">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} className="text-[#62666d]" />
                <span className="text-[20px] font-[510] text-[#ffffff]" style={{ letterSpacing: "-0.24px" }}>
                  {value}
                </span>
              </div>
              <p className="text-[12px] text-[#62666d]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
