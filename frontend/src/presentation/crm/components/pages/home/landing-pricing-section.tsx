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
    <section id="pricing" className="py-20 bg-background relative border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-[12px] font-[510] text-muted-foreground uppercase tracking-[0.08em] mb-3">
            Planes Claros y Transparentes
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-[510] text-foreground tracking-tight">
            Inversión adaptada a la escala de tu empresa
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Sin costos ocultos ni comisiones por mensaje enviado.
          </p>

          {/* Toggle Monthly / Annual */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-muted border border-border">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !annual ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Facturación Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                annual ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Facturación Anual</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">-20% Ahorro</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 relative ${
                plan.highlight
                  ? "bg-card border-2 border-primary shadow-lg ring-1 ring-primary/20"
                  : "bg-card border border-border hover:border-border/80 shadow-xs"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wide shadow-xs uppercase">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">{plan.name}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground min-h-[32px]">{plan.desc}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-foreground tracking-tight">${plan.price}</span>
                  <span className="text-xs text-muted-foreground font-medium">USD / mes</span>
                </div>

                <div className="mt-6 space-y-2.5 pt-5 border-t border-border">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-foreground">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-border">
                <Link
                  href="/login?redirect=/crm"
                  className={`w-full py-2.5 px-4 rounded-lg text-center text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 group ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>Iniciar con {plan.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
