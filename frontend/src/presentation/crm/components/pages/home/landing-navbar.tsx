"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, ShieldCheck, Menu, X, Layers } from "lucide-react"
import { ThemeToggle } from "@/src/presentation/crm/components/common/theme-toggle"

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0b0e14]/90 backdrop-blur-md border-b border-white/[0.08] shadow-2xl py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform text-white font-bold text-base">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-slate-100 tracking-tight leading-none flex items-center gap-1.5">
              NEXORA <span className="text-blue-400 text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/20 font-mono">ENTERPRISE</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Suite Omnicanal & IA</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-blue-400 transition-colors">Soluciones</a>
          <a href="#comparison" className="hover:text-blue-400 transition-colors">Comparativa</a>
          <a href="#pricing" className="hover:text-blue-400 transition-colors">Planes</a>
          <a href="#security" className="hover:text-blue-400 transition-colors">Seguridad & SLA</a>
          <Link href="/portal" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Portal Clientes
          </Link>
        </nav>

        {/* Right CTA + Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login?redirect=/crm"
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/login?redirect=/crm"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/25 border border-blue-400/30 hover:shadow-blue-500/40 transition-all flex items-center gap-1.5 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200 group-hover:rotate-12 transition-transform" />
            <span>Demo en Vivo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c1017] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-3">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-slate-300">Soluciones</a>
          <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-slate-300">Comparativa</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-slate-300">Planes</a>
          <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-slate-300">Seguridad</a>
          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            <Link href="/login?redirect=/crm" className="w-full py-2.5 text-center text-xs font-semibold text-white bg-white/[0.06] rounded-lg">
              Iniciar Sesión
            </Link>
            <Link href="/login?redirect=/crm" className="w-full py-2.5 text-center text-xs font-semibold text-white bg-blue-600 rounded-lg">
              Acceder a la Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
