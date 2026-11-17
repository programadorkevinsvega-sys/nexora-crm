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
    <section id="comparison" className="py-20 bg-muted/20 relative border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retorno de Inversión Inmediato</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-[510] text-foreground tracking-tight">
            ¿Por qué pagar miles de dólares en 5 herramientas separadas?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Descubre cómo Nexora unifica todo tu flujo comercial en una sola suite centralizada sin costos ocultos.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-foreground">
                <th className="py-4 px-6 font-bold text-foreground">Capacidad Comercial</th>
                <th className="py-4 px-6 font-extrabold text-primary bg-primary/5 border-x border-border">
                  NEXORA CRM
                </th>
                <th className="py-4 px-6 font-semibold text-muted-foreground">CRMs Tradicionales + Add-ons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, idx) => (
                <tr key={row.feature} className={idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"}>
                  <td className="py-3.5 px-6 font-medium text-foreground">{row.feature}</td>
                  <td className="py-3.5 px-6 bg-primary/5 border-x border-border">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <Check className="w-3 h-3" /> Incluido
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    {typeof row.others === "boolean" ? (
                      row.others ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                          <X className="w-3.5 h-3.5" /> No disponible
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">{row.others}</span>
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
