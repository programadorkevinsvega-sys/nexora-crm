"use client"

import {
  Kanban,
  MessageSquare,
  FileSignature,
  Mail,
  PhoneCall,
  BrainCircuit,
  TrendingUp,
  FileCheck2,
  Users2,
  ShieldAlert,
  Zap,
} from "lucide-react"

export function LandingBentoGrid() {
  const features = [
    {
      title: "Pipelines Kanban & Deals B2B",
      desc: "Gestión visual de oportunidades con etapas personalizadas, cálculo automático de probabilidad y visión 360° de contactos y empresas.",
      icon: Kanban,
      color: "from-cyan-500 to-blue-600",
      badge: "Ventas Core",
    },
    {
      title: "WhatsApp Cloud API & Social Inbox",
      desc: "Bandeja de entrada omnicanal para WhatsApp, Facebook Messenger e Instagram DM con auto-respuestas inteligentes con IA y captura directa de leads.",
      icon: MessageSquare,
      color: "from-emerald-500 to-teal-600",
      badge: "Omnicanal",
    },
    {
      title: "CPQ & Firma Electrónica HMAC",
      desc: "Catálogo de productos, cotizaciones multi-moneda con cálculo de impuestos y contratos legales con firma digital OTP con validez probatoria.",
      icon: FileSignature,
      color: "from-blue-500 to-indigo-600",
      badge: "Legal & CPQ",
    },
    {
      title: "Email Marketing & Visual Designer",
      desc: "Diseñador drag-and-drop de plantillas de correo responsive, envíos masivos por SMTP y píxel invisible para rastreo de tasas de apertura en tiempo real.",
      icon: Mail,
      color: "from-purple-500 to-pink-600",
      badge: "Marketing",
    },
    {
      title: "Telefonía VoIP Click-to-Call",
      desc: "Llama a tus clientes directamente desde el navegador con un clic usando Twilio Programmable Voice, con grabación automática vinculada al contacto.",
      icon: PhoneCall,
      color: "from-amber-500 to-orange-600",
      badge: "Telefonía",
    },
    {
      title: "Forecasting IA & Base RAG",
      desc: "Proyección trimestral de ingresos por Machine Learning, detección de riesgo de fuga (Churn) y asistente de IA entrenado en tus propios PDFs de Cloudflare R2.",
      icon: BrainCircuit,
      color: "from-rose-500 to-red-600",
      badge: "Inteligencia Artificial",
    },
  ]

  return (
    <section id="features" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Capacidades de Vanguardia
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Diseñado para Reemplazar Todo tu Software Antiguo
          </p>
          <p className="mt-4 text-base text-slate-400">
            Cada módulo ha sido construido con arquitectura limpia independiente, comunicados por gRPC de baja latencia para máximo rendimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group relative p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide text-slate-300 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
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
