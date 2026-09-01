"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, ArrowRight } from "lucide-react"

export function LandingPricingSection() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: "Starter Pro",
      desc: "Para equipos comerciales en crecimiento que buscan centralizar contactos y pipelines.",
      price: annual ? 39 : 49,
      badge: null,
      highlight: false,
      features: [
        "Hasta 5 usuarios incluidos",
        "Gestión de Contactos 360° y Empresas B2B",
        "Pipelines Kanban con probabilidad",
        "Formularios Web incrustables y leads",
        "Tareas, Notas y Timeline de actividades",
        "Soporte estándar prioritario",
      ],
    },
    {
      name: "Growth Suite",
      desc: "La solución completa para empresas que requieren omnicanalidad y ventas CPQ.",
      price: annual ? 129 : 159,
      badge: "Más Elegido",
      highlight: true,
      features: [
        "Hasta 15 usuarios incluidos",
        "WhatsApp Cloud API & Social Inbox",
        "Cotizaciones CPQ & Contratos con Firma Legal",
        "Diseñador de Emails Drag-and-Drop",
        "Helpdesk con SLAs y Buzones",
        "Módulo de Afiliados y Programas de Fidelización",
        "Lead Scoring Predictivo",
      ],
    },
    {
      name: "Enterprise Unlimited",
      desc: "Infraestructura sin límites con Copiloto IA, Telefonía VoIP y Auditoría.",
      price: annual ? 399 : 499,
      badge: "Corporativo",
      highlight: false,
      features: [
        "Usuarios y contactos ilimitados",
        "Copiloto IA con búsqueda RAG en documentos",
        "Forecasting trimestral automatizado de ingresos",
        "Telefonía VoIP Click-to-Call en navegador",
        "Auditoría inmutable de eventos (Audit Logs)",
        "API Keys y Webhooks para Desarrolladores",
        "SLA 99.99% y Gerente de Cuenta Dedicado",
      ],
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-[#080a0f] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Planes Claros y Transparentes
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Inversión Adaptada a la Escala de tu Empresa
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Sin costos ocultos ni comisiones por mensaje enviado.
          </p>

          {/* Toggle Monthly / Annual */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-[#0f1420] border border-white/[0.08]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                !annual ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                annual ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Facturación Anual</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-[10px] text-blue-300 font-bold">-20% Ahorro</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlight
                  ? "bg-gradient-to-b from-[#111726] to-[#0c0f17] border-2 border-blue-500 shadow-2xl shadow-blue-500/15 scale-105"
                  : "bg-[#0f1420]/80 border border-white/[0.08] hover:border-white/[0.16]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wide shadow-md shadow-blue-600/30">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                <p className="mt-2 text-xs text-slate-400 min-h-[32px]">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-xs text-slate-400 font-medium">USD / mes</span>
                </div>

                <div className="mt-8 space-y-3 pt-6 border-t border-white/[0.08]">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <Link
                  href="/login?redirect=/crm"
                  className={`w-full py-3 px-4 rounded-xl text-center text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 group ${
                    plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
                      : "bg-white/[0.06] text-slate-200 hover:bg-white/[0.1] hover:text-white"
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
