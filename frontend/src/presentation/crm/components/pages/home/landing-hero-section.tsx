"use client"

import Link from "next/link"
import { Sparkles, ArrowRight, Play, ShieldCheck, CheckCircle2, Lock, TrendingUp, Phone, MessageSquare, FileSignature } from "lucide-react"

export function LandingHeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-25">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111726]/90 border border-blue-500/30 text-xs text-blue-300 shadow-inner mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="font-semibold">Nexora Enterprise CRM</span> — Omnicanalidad, CPQ y Automatización Predictiva
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          La Plataforma Empresarial para{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Cerrar Ventas y Fidelizar Clientes
          </span>{" "}
          a Gran Escala.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Unifica tu proceso comercial completo: prospección omnicanal (WhatsApp Cloud, Meta Ads, TikTok), telefonía VoIP en navegador, cotizaciones CPQ con firma electrónica legal, helpdesk con SLA y copiloto de IA con búsqueda RAG.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login?redirect=/crm"
            className="w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xl shadow-blue-600/30 border border-blue-400/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explorar Demo Interactiva</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-7 py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
            <span>Ver Ecosistema Completo</span>
          </a>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-400 backdrop-blur-sm">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso Demo Inmediato: <strong className="text-slate-200">demo@nexoracrm.com</strong> / <strong className="text-slate-200">Password123!</strong></span>
        </div>

        {/* Enterprise Metrics Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8 border-t border-white/[0.08] text-left">
          <div className="p-4 rounded-xl bg-[#0f1420]/80 border border-white/[0.08] backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 flex items-center gap-1">
              +38% <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Conversión de Oportunidades</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0f1420]/80 border border-white/[0.08] backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">99.99%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Disponibilidad SLA Garantizada</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0f1420]/80 border border-white/[0.08] backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">&lt; 20ms</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Velocidad de Respuesta Global</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0f1420]/80 border border-white/[0.08] backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">AES-256</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Cifrado y Aislamiento por Tenant</div>
          </div>
        </div>
      </div>
    </section>
  )
}
