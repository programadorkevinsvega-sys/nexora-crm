"use client"

import { Check, X, Sparkles } from "lucide-react"

export function LandingComparisonSection() {
  const rows = [
    { feature: "Pipelines Ilimitados & Visión 360° de Clientes", nexora: true, others: "Cobro por usuario ($$$)" },
    { feature: "WhatsApp Cloud API Nativo sin comisiones por mensaje", nexora: true, others: false },
    { feature: "Generador de Cotizaciones CPQ & Firma Digital Legal", nexora: true, others: "Módulo Add-on costoso" },
    { feature: "Diseñador de Emails Drag-and-Drop + Pixel Tracking", nexora: true, others: "Límites de contactos" },
    { feature: "Telefonía VoIP Click-to-Call en Navegador", nexora: true, others: "Integración externa ($$$)" },
    { feature: "Copiloto IA entrenado con tus Propios Documentos", nexora: true, others: false },
    { feature: "Forecasting Predictivo Trimestral Automatizado", nexora: true, others: "Solo Planes Enterprise" },
    { feature: "Aislamiento de Datos Cifrado por Empresa", nexora: true, others: "Costo adicional" },
  ]

  return (
    <section id="comparison" className="py-24 bg-[#0a0d14] relative border-y border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Retorno de Inversión Inmediato</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¿Por qué Pagar Miles de Dólares en 5 Herramientas Separadas?
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Descubre cómo Nexora unifica todo tu flujo comercial en una sola suite centralizada sin costos ocultos.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0f1420]/80 shadow-2xl backdrop-blur-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-300">
                <th className="py-4 px-6 font-bold text-slate-200">Capacidad Comercial</th>
                <th className="py-4 px-6 font-extrabold text-blue-400 bg-blue-600/10 border-x border-blue-500/20">
                  NEXORA CRM
                </th>
                <th className="py-4 px-6 font-semibold text-slate-400">CRMs Tradicionales + Add-ons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {rows.map((row, idx) => (
                <tr key={row.feature} className={idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"}>
                  <td className="py-3.5 px-6 font-medium text-slate-200">{row.feature}</td>
                  <td className="py-3.5 px-6 bg-blue-600/[0.06] border-x border-blue-500/15">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold text-[11px]">
                      <Check className="w-3 h-3 text-emerald-400" /> Incluido
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">
                    {typeof row.others === "boolean" ? (
                      row.others ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-medium">
                          <X className="w-3.5 h-3.5" /> No disponible
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-amber-300 font-medium">{row.others}</span>
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
