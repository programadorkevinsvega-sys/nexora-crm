"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, ShieldCheck, Menu, X, Layers } from "lucide-react"

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
        scrolled ? "bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-tight leading-none flex items-center gap-1.5">
              NEXORA <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 font-mono">CRM</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Enterprise Suite</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Capacidades</a>
          <a href="#comparison" className="hover:text-cyan-400 transition-colors">Comparativa</a>
          <a href="#pricing" className="hover:text-cyan-400 transition-colors">Precios</a>
          <a href="#tech" className="hover:text-cyan-400 transition-colors">Arquitectura</a>
          <Link href="/portal" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Portal Clientes
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center gap-1.5 group"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>Demo en Vivo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">Capacidades</a>
          <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">Comparativa</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">Precios</a>
          <a href="#tech" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">Arquitectura</a>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link href="/login" className="w-full py-2 text-center text-sm font-semibold text-white bg-slate-800 rounded-lg">
              Iniciar Sesión
            </Link>
            <Link href="/login" className="w-full py-2 text-center text-sm font-semibold text-white bg-cyan-600 rounded-lg">
              Acceder a la Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
