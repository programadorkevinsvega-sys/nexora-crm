"use client"

import Link from "next/link"
import { Layers, ShieldCheck, Heart } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">NEXORA CRM</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              La plataforma empresarial definitiva para ventas, soporte omnicanal, cotizaciones CPQ y automatización con IA.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-white mb-3 tracking-wider uppercase text-[11px]">Módulos</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Pipelines Kanban</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">WhatsApp & Inbox</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Cotizaciones CPQ</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Firma Electrónica</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">VoIP Click-to-Call</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-white mb-3 tracking-wider uppercase text-[11px]">Plataforma</h4>
            <ul className="space-y-2">
              <li><Link href="/portal" className="hover:text-cyan-400 transition-colors">Portal de Clientes</Link></li>
              <li><a href="/api/docs" target="_blank" className="hover:text-cyan-400 transition-colors">API Docs (Swagger)</a></li>
              <li><a href="#tech" className="hover:text-cyan-400 transition-colors">Arquitectura DDD</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Planes y Precios</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-white mb-3 tracking-wider uppercase text-[11px]">Seguridad & Acceso</h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Trust Architecture</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Cifrado SSL de extremo a extremo y aislamiento por Row-Level Security en PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Nexora CRM Enterprise. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado con estándares de alta ingeniería y <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />.
          </p>
        </div>
      </div>
    </footer>
  )
}
