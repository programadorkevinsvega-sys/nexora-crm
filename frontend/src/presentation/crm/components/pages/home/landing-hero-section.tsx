"use client"

import Link from "next/link"
import { Sparkles, ArrowRight, Play, Shield, CheckCircle2, Zap, Lock } from "lucide-react"

export function LandingHeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Gradients & Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 left-1/3 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-300 shadow-inner mb-8">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-semibold">Nexora 2.0</span> — Arquitectura Modular DDD + IA & WhatsApp Cloud
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Todo tu Negocio, Ventas,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
            WhatsApp e Inteligencia Artificial
          </span>{" "}
          en una Sola Suite.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Reemplaza HubSpot, Salesforce, Zendesk y Mailchimp. Gestiona contactos 360°, cotizaciones CPQ con firma electrónica, helpdesk con SLA, campañas de marketing masivo y telefonía VoIP en un solo lugar.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login?redirect=/crm"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Probar Demo en Vivo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-7 py-4 text-base font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>Explorar los 21 Módulos</span>
          </a>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Credenciales Demo: <strong className="text-slate-200">demo@nexoracrm.com</strong> / <strong className="text-slate-200">Password123!</strong></span>
        </div>

        {/* Metric Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">66+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Páginas & Rutas Activas</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">21</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Bounded Contexts DDD</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">&lt; 50ms</div>
            <div className="text-xs text-slate-400 font-medium mt-1">gRPC Microservicios</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Multi-tenant RLS Isolation</div>
          </div>
        </div>
      </div>
    </section>
  )
}
