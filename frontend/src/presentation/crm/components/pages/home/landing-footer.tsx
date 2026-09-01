"use client"

import Link from "next/link"
import { ShieldCheck, Heart } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-[#06080c] border-t border-white/[0.08] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                N
              </div>
              <span className="font-bold text-sm text-white tracking-tight">NEXORA CRM</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              La plataforma empresarial todo-en-uno para ventas B2B, marketing, soporte omnicanal y análisis predictivo.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-white mb-3 tracking-wider uppercase text-[10px]">Soluciones</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Pipelines & Oportunidades</a></li>
              <li><a href="#features" className="hover:text-blue-400 transition-colors">WhatsApp & Bandeja Social</a></li>
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Cotizaciones CPQ</a></li>
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Firma Electrónica Legal</a></li>
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Telefonía VoIP Click-to-Call</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-white mb-3 tracking-wider uppercase text-[10px]">Ecosistema</h4>
            <ul className="space-y-2">
              <li><Link href="/portal" className="hover:text-blue-400 transition-colors">Portal de Clientes</Link></li>
              <li><a href="/api/docs" target="_blank" className="hover:text-blue-400 transition-colors">API Docs & OpenAPI</a></li>
              <li><a href="#security" className="hover:text-blue-400 transition-colors">Seguridad & Cumplimiento</a></li>
              <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Planes y Precios</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-white mb-3 tracking-wider uppercase text-[10px]">Seguridad Certificada</h4>
            <div className="p-3.5 rounded-xl bg-[#0f1420] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protección Criptográfica</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Cifrado bancario en tránsito y en reposo con aislamiento de datos por empresa.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Nexora CRM Enterprise. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado para empresas globales de alto rendimiento.
          </p>
        </div>
      </div>
    </footer>
  )
}
