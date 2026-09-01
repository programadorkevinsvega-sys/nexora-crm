"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border py-12 text-muted-foreground text-xs">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                N
              </div>
              <span className="font-semibold text-sm text-foreground tracking-tight">NEXORA CRM</span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed">
              La plataforma empresarial todo-en-uno para ventas B2B, marketing, soporte omnicanal y análisis predictivo.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 tracking-wider uppercase text-[10px]">Soluciones</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-foreground transition-colors">Pipelines & Oportunidades</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">WhatsApp & Bandeja Social</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Cotizaciones CPQ</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Firma Electrónica Legal</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Telefonía VoIP Click-to-Call</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 tracking-wider uppercase text-[10px]">Ecosistema</h4>
            <ul className="space-y-2">
              <li><Link href="/portal" className="hover:text-foreground transition-colors">Portal de Clientes</Link></li>
              <li><a href="/api/docs" target="_blank" className="hover:text-foreground transition-colors">API Docs & OpenAPI</a></li>
              <li><a href="#security" className="hover:text-foreground transition-colors">Seguridad & Cumplimiento</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Planes y Precios</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 tracking-wider uppercase text-[10px]">Seguridad Certificada</h4>
            <div className="p-3.5 rounded-xl bg-card border border-border space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protección Criptográfica</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Cifrado bancario en tránsito y en reposo con aislamiento de datos por empresa.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Nexora CRM Enterprise. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado para empresas globales de alto rendimiento.
          </p>
        </div>
      </div>
    </footer>
  )
}
