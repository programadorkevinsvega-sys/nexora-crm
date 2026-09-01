"use client"

import { ShieldCheck, Lock, Database, Zap, Activity, Globe } from "lucide-react"

export function LandingTechStackSection() {
  const securityPillars = [
    {
      title: "Aislamiento Criptográfico de Datos",
      desc: "Cada empresa opera en un entorno lógico blindado con políticas estrictas de aislamiento por inquilino.",
      icon: Database,
      color: "text-blue-500",
    },
    {
      title: "Cifrado en Tránsito y en Reposo (AES-256)",
      desc: "Todas las comunicaciones viajan a través de túneles TLS 1.3 con certificados de máxima seguridad.",
      icon: Lock,
      color: "text-emerald-500",
    },
    {
      title: "Disponibilidad y Rendimiento SLA 99.99%",
      desc: "Infraestructura de alta velocidad distribuida globalmente con tiempos de respuesta inferiores a 20ms.",
      icon: Zap,
      color: "text-indigo-500",
    },
    {
      title: "Registro de Auditoría Inmutable",
      desc: "Trazabilidad forense de cada creación, modificación, llamada y evento de firma para cumplimiento corporativo.",
      icon: Activity,
      color: "text-purple-500",
    },
    {
      title: "Almacenamiento Seguro de Archivos & PDFs",
      desc: "Documentos legales, contratos firmados y grabaciones VoIP resguardados con redundancia geográfica.",
      icon: ShieldCheck,
      color: "text-amber-500",
    },
    {
      title: "Integraciones Empresariales & Webhooks",
      desc: "APIs abiertas y webhooks en tiempo real para conectar con tu ERP, pasarelas de pago y sistemas legados.",
      icon: Globe,
      color: "text-cyan-500",
    },
  ]

  return (
    <section id="security" className="py-20 bg-muted/20 relative border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Seguridad & Confianza Empresarial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-[510] text-foreground tracking-tight">
            Seguridad de grado bancario para tus clientes
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Diseñado para cumplir con los estándares de privacidad, continuidad de negocio y auditoría de las empresas más exigentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {securityPillars.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-border/80 transition-all flex items-start gap-4 shadow-xs"
              >
                <div className="p-2.5 rounded-lg bg-muted border border-border shrink-0">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
