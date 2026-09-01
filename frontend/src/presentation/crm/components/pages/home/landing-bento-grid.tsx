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
    <section id="features" className="py-24 bg-[#08090a] border-t border-[#23252a]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="mb-16">
          <p className="text-[12px] font-[510] text-[#62666d] uppercase tracking-[0.08em] mb-4">
            Ecosistema de soluciones
          </p>
          <h2
            className="text-[32px] font-[400] text-[#ffffff] max-w-xl leading-[1.13]"
            style={{ letterSpacing: "-0.704px" }}
          >
            Todo lo que necesitas para crecer en una sola plataforma.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#23252a] border border-[#23252a] rounded-[12px] overflow-hidden">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="bg-[#0f1011] p-6 flex flex-col justify-between hover:bg-[#161718] transition-colors group cursor-default"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[rgba(255,255,255,0.04)] border border-[#23252a]">
                      <Icon size={15} className="text-[#8a8f98] group-hover:text-[#d0d6e0] transition-colors" />
                    </div>
                    <span className="text-[11px] font-[400] text-[#62666d] px-2 py-0.5 rounded-[4px] bg-[rgba(255,255,255,0.04)]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-[510] text-[#d0d6e0] group-hover:text-[#ffffff] transition-colors leading-[1.4] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-[13px] text-[#62666d] leading-[1.6]">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-[12px] font-[400] text-[#62666d] group-hover:text-[#8a8f98] transition-colors">
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
