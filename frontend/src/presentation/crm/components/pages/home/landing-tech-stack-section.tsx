"use client"

import { ShieldCheck, Lock, Database, Zap, Activity, Globe } from "lucide-react"

export function LandingTechStackSection() {
  const securityPillars = [
    {
      title: "Aislamiento Criptográfico de Datos",
      desc: "Cada empresa opera en un entorno lógico blindado con políticas estrictas de aislamiento por inquilino.",
      icon: Database,
      color: "text-blue-400",
    },
    {
      title: "Cifrado en Tránsito y en Reposo (AES-256)",
      desc: "Todas las comunicaciones viajan a través de túneles TLS 1.3 con certificados de máxima seguridad.",
      icon: Lock,
      color: "text-emerald-400",
    },
    {
      title: "Disponibilidad y Rendimiento SLA 99.99%",
      desc: "Infraestructura de alta velocidad distribuida globalmente con tiempos de respuesta inferiores a 20ms.",
      icon: Zap,
      color: "text-indigo-400",
    },
    {
      title: "Registro de Auditoría Inmutable",
      desc: "Trazabilidad forense de cada creación, modificación, llamada y evento de firma para cumplimiento corporativo.",
      icon: Activity,
      color: "text-purple-400",
    },
    {
      title: "Almacenamiento Seguro de Archivos & PDFs",
      desc: "Documentos legales, contratos firmados y grabaciones VoIP resguardados con redundancia geográfica.",
      icon: ShieldCheck,
      color: "text-amber-400",
    },
    {
      title: "Integraciones Empresariales & Webhooks",
      desc: "APIs abiertas y webhooks en tiempo real para conectar con tu ERP, pasarelas de pago y sistemas legados.",
      icon: Globe,
      color: "text-cyan-400",
    },
  ]

  return (
    <section id="security" className="py-24 bg-[#080a0f] relative border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Seguridad & Confianza Empresarial</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Seguridad de Grado Bancario para tus Clientes
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Diseñado para cumplir con los estándares de privacidad, continuidad de negocio y auditoría de las empresas más exigentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-[#0f1420]/80 border border-white/[0.08] hover:border-white/[0.16] transition-all flex items-start gap-4 shadow-lg shadow-black/20"
              >
                <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.08] shrink-0">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
