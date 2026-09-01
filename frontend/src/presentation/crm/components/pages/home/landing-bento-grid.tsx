"use client"

import {
  Kanban,
  MessageSquare,
  FileSignature,
  Mail,
  PhoneCall,
  BrainCircuit,
  Zap,
} from "lucide-react"

export function LandingBentoGrid() {
  const features = [
    {
      title: "Pipelines Visuales & Gestión de Deals",
      desc: "Seguimiento en tiempo real de oportunidades comerciales, cálculo automático de probabilidad ponderada y vista unificada de cuentas B2B.",
      icon: Kanban,
      color: "from-blue-600 to-indigo-600",
      badge: "Ventas B2B",
    },
    {
      title: "WhatsApp Cloud API & Bandeja Social",
      desc: "Atiende conversaciones de WhatsApp, Instagram y Facebook en un solo buzón unificado con asignación automática a agentes y respuestas con IA.",
      icon: MessageSquare,
      color: "from-emerald-600 to-teal-600",
      badge: "Omnicanalidad",
    },
    {
      title: "Cotizaciones CPQ & Firma Electrónica",
      desc: "Genera propuestas comerciales con cálculo dinámico de descuentos e impuestos, y envía contratos para firma digital con validez legal probatoria.",
      icon: FileSignature,
      color: "from-blue-500 to-cyan-600",
      badge: "CPQ & Legal",
    },
    {
      title: "Marketing Masivo & Diseñador Visual",
      desc: "Crea correos electrónicos atractivos con editor visual Drag-and-Drop, envíos masivos con seguimiento de aperturas y clics en tiempo real.",
      icon: Mail,
      color: "from-purple-600 to-pink-600",
      badge: "Marketing",
    },
    {
      title: "Telefonía VoIP Click-to-Call",
      desc: "Realiza y recibe llamadas directamente desde el navegador web sin teléfonos físicos, con grabación y registro automático en el historial del cliente.",
      icon: PhoneCall,
      color: "from-amber-600 to-orange-600",
      badge: "Telefonía",
    },
    {
      title: "Forecasting Predictivo & Copiloto IA",
      desc: "Anticipa el cierre de ingresos a 3 y 6 meses con modelos predictivos, y consulta a tu asistente de IA entrenado en tu propia base documental.",
      icon: BrainCircuit,
      color: "from-rose-600 to-red-600",
      badge: "Inteligencia Artificial",
    },
  ]

  return (
    <section id="features" className="py-24 bg-[#080a0f] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Ecosistema de Soluciones
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Todo lo que Necesitas para Crecer en una Sola Plataforma
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Elimina silos de información conectando ventas, atención al cliente, marketing y facturación con sincronización instantánea.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group relative p-7 rounded-2xl bg-[#0f1420]/80 border border-white/[0.08] hover:border-white/[0.16] hover:bg-[#121826] transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide text-slate-300 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Incluido en la Suite</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
