"use client"

import { Server, Database, Cpu, ShieldCheck, Network, Lock, Sparkles } from "lucide-react"

export function LandingTechStackSection() {
  const stacks = [
    {
      title: "Modular Monolith (DDD)",
      desc: "21 Bounded Contexts independientes con Clean Architecture y principios SOLID.",
      icon: Server,
      color: "text-cyan-400",
    },
    {
      title: "gRPC & Protocol Buffers",
      desc: "Microservicios internos multiplexados por HTTP/2 con latencias inferiores a 50ms.",
      icon: Cpu,
      color: "text-blue-400",
    },
    {
      title: "PostgreSQL con RLS Puro",
      desc: "Aislamiento estricto multi-tenant por Row-Level Security sin mezcla de datos.",
      icon: Database,
      color: "text-emerald-400",
    },
    {
      title: "NATS JetStream Outbox",
      desc: "Publicación transaccional garantizada de eventos asíncronos y auditoría continua.",
      icon: Network,
      color: "text-indigo-400",
    },
    {
      title: "Next.js 16 & Turbopack",
      desc: "React 19 Server Components y generación estática optimizada para máxima velocidad.",
      icon: Sparkles,
      color: "text-purple-400",
    },
    {
      title: "Cloudflare Zero Trust & R2",
      desc: "Túneles encriptados sin puertos públicos expuestos y almacenamiento seguro de PDFs.",
      icon: Lock,
      color: "text-amber-400",
    },
  ]

  return (
    <section id="tech" className="py-24 bg-slate-900/30 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Infraestructura de Grado Bancario</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ingeniería de Alto Rendimiento
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Construido para soportar millones de registros diarios con disponibilidad garantizada y seguridad Zero Trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stacks.map((stack) => {
            const Icon = stack.icon
            return (
              <div
                key={stack.title}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  <Icon className={`w-6 h-6 ${stack.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{stack.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{stack.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
