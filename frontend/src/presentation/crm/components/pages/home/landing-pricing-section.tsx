"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, Sparkles, ArrowRight, Zap, ShieldCheck } from "lucide-react"

export function LandingPricingSection() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: "Starter",
      desc: "Ideal para emprendedores y pequeños equipos comerciales.",
      price: annual ? 39 : 49,
      badge: null,
      highlight: false,
      features: [
        "Hasta 3 usuarios",
        "Gestión de Contactos 360° y Empresas B2B",
        "Pipelines Kanban ilimitados",
        "Formularios Web incrustables",
        "Notas, Tareas y Actividades",
        "Soporte estándar por email",
      ],
    },
    {
      name: "Professional",
      desc: "Para empresas en expansión que necesitan automatización y omnicanalidad.",
      price: annual ? 149 : 179,
      badge: "Más Popular",
      highlight: true,
      features: [
        "Hasta 10 usuarios",
        "WhatsApp Cloud API integrado",
        "Social Inbox (Facebook e Instagram DM)",
        "Cotizaciones CPQ & Contratos con Firma",
        "Diseñador de Emails Drag-and-Drop",
        "Helpdesk con SLA y Tickets",
        "Módulo de Afiliados y Fidelización",
      ],
    },
    {
      name: "Enterprise",
      desc: "Suite completa con IA, Telefonía VoIP y Auditoría bancaria.",
      price: annual ? 499 : 599,
      badge: "Completo",
      highlight: false,
      features: [
        "Usuarios y contactos ilimitados",
        "IA RAG con subida de archivos a Cloudflare R2",
        "Forecasting trimestral automatizado",
        "VoIP Click-to-Call con Twilio Voice",
        "Auditoría inmutable de cambios (Audit Logs)",
        "API Keys y Webhooks para Desarrolladores",
        "Base de datos con RLS dedicado",
      ],
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Precios Transparentes
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Planes Diseñados para Escalar tu Rentabilidad
          </p>
          <p className="mt-4 text-base text-slate-400">
            Sin contratos forzosos. Cancela en cualquier momento.
          </p>

          {/* Toggle Monthly / Annual */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                !annual ? "bg-cyan-500 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                annual ? "bg-cyan-500 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Facturación Anual</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-900 text-[10px] text-cyan-200 font-bold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlight
                  ? "bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/10 scale-105"
                  : "bg-slate-900/50 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-bold tracking-wide shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-xs text-slate-400 min-h-[32px]">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-xs text-slate-400 font-medium">USD / mes</span>
                </div>

                <div className="mt-8 space-y-3 pt-6 border-t border-slate-800">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <Link
                  href="/login?redirect=/crm"
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 group ${
                    plan.highlight
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <span>Iniciar con {plan.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
