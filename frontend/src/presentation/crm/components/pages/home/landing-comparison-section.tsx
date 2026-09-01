"use client"

import { Check, X, Sparkles } from "lucide-react"

export function LandingComparisonSection() {
  const rows = [
    { feature: "Pipelines Ilimitados & Visión 360°", nexora: true, others: "Parcial ($$$)" },
    { feature: "WhatsApp Cloud API Nativo sin cobros extra", nexora: true, others: false },
    { feature: "Generador de Cotizaciones CPQ & Firma HMAC", nexora: true, others: "Módulo Add-on ($$$)" },
    { feature: "Diseñador de Emails Drag-and-Drop + Tracking", nexora: true, others: "Límites estrictos" },
    { feature: "Telefonía VoIP Click-to-Call integrada", nexora: true, others: "Terceros ($$$)" },
    { feature: "IA RAG entrenada con tus Documentos en R2", nexora: true, others: false },
    { feature: "Forecasting Predictivo Trimestral", nexora: true, others: "Solo Plan Enterprise" },
    { feature: "Aislamiento de Datos por Row-Level Security (RLS)", nexora: true, others: "Solo On-premise" },
  ]

  return (
    <section id="comparison" className="py-24 bg-slate-900/40 relative border-y border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs text-cyan-300 font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ahorro Inteligente</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¿Por qué pagar $1,000 USD al mes por 5 apps distintas?
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Compara cómo Nexora unifica tus procesos en una sola pantalla sin costos ocultos por usuario.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
                <th className="py-5 px-6 font-bold text-slate-200">Capacidad</th>
                <th className="py-5 px-6 font-extrabold text-cyan-400 bg-cyan-950/30 border-x border-cyan-800/40">
                  NEXORA CRM
                </th>
                <th className="py-5 px-6 font-semibold text-slate-400">HubSpot / Salesforce + Add-ons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map((row, idx) => (
                <tr key={row.feature} className={idx % 2 === 0 ? "bg-slate-950" : "bg-slate-900/20"}>
                  <td className="py-4 px-6 font-medium text-slate-200">{row.feature}</td>
                  <td className="py-4 px-6 bg-cyan-950/20 border-x border-cyan-800/30">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Incluido
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {typeof row.others === "boolean" ? (
                      row.others ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                          <X className="w-3.5 h-3.5" /> No disponible
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-amber-300/90 font-medium">{row.others}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
