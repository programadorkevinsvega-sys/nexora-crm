"use client"

import { Kanban, MessageSquare, FileSignature, Mail, PhoneCall, TrendingUp, ArrowRight } from "lucide-react"

const features = [
  {
    title: "Pipelines Visuales & Gestión de Deals",
    desc: "Seguimiento en tiempo real de oportunidades, probabilidad ponderada automática y vista unificada de cuentas B2B.",
    icon: Kanban,
    badge: "Ventas B2B",
  },
  {
    title: "WhatsApp Cloud API & Bandeja Social",
    desc: "Atiende conversaciones de WhatsApp, Instagram y Facebook en un solo buzón con asignación automática a agentes.",
    icon: MessageSquare,
    badge: "Omnicanalidad",
  },
  {
    title: "Cotizaciones CPQ & Firma Electrónica",
    desc: "Propuestas con cálculo dinámico de descuentos e impuestos. Contratos con firma digital de validez legal probatoria.",
    icon: FileSignature,
    badge: "CPQ & Legal",
  },
  {
    title: "Marketing Masivo & Diseñador Visual",
    desc: "Editor de correos Drag-and-Drop, envíos masivos segmentados con seguimiento de aperturas y clics en tiempo real.",
    icon: Mail,
    badge: "Marketing",
  },
  {
    title: "Telefonía VoIP Click-to-Call",
    desc: "Llamadas desde el navegador sin hardware físico, con grabación automática y registro en el historial del cliente.",
    icon: PhoneCall,
    badge: "Telefonía",
  },
  {
    title: "Forecasting Predictivo & Copiloto IA",
    desc: "Proyección de ingresos a 3 y 6 meses con modelos predictivos. Asistente IA entrenado en tu base documental propia.",
    icon: TrendingUp,
    badge: "Inteligencia Artificial",
  },
]

export function LandingBentoGrid() {
  return (
    <section id="features" className="py-20 bg-background border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-[12px] font-[510] text-muted-foreground uppercase tracking-[0.08em] mb-3">
            Ecosistema de soluciones
          </p>
          <h2
            className="text-[30px] sm:text-[36px] font-[510] text-foreground max-w-xl leading-tight tracking-tight"
          >
            Todo lo que necesitas para crecer en una sola plataforma.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden shadow-xs">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="bg-card p-6 flex flex-col justify-between hover:bg-muted/50 transition-colors group cursor-default"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <Icon size={16} />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-[510] text-foreground leading-snug mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-[12px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>Incluido en la Suite</span>
                  <ArrowRight size={11} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
