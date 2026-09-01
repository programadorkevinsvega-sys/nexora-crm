"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#features", label: "Soluciones" },
    { href: "#comparison", label: "Comparativa" },
    { href: "#pricing", label: "Planes" },
    { href: "#security", label: "Seguridad & SLA" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-[#08090a]/95 backdrop-blur-md border-b border-[#23252a]" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-[7px] w-[7px] rounded-[1px] bg-[#e4f222]" />
          <span className="text-[15px] font-[510] tracking-[-0.011em] text-[#ffffff]">NEXORA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-[13px] font-[400] text-[#8a8f98] hover:text-[#d0d6e0] transition-colors rounded-[6px] hover:bg-[rgba(255,255,255,0.04)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/login?redirect=/crm"
            className="px-3 py-1.5 text-[13px] font-[400] text-[#8a8f98] hover:text-[#d0d6e0] rounded-[6px] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login?redirect=/crm"
            className="px-4 py-1.5 text-[13px] font-[510] tracking-[-0.011em] text-[#08090a] bg-[#e4f222] hover:bg-[#edf755] rounded-[9999px] transition-colors shadow-[rgba(0,0,0,0.07)_0px_1px_1px_0px]"
          >
            Solicitar demo
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[6px] text-[#8a8f98] hover:text-[#d0d6e0] hover:bg-[rgba(255,255,255,0.04)]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08090a] border-b border-[#23252a] px-6 pt-2 pb-5 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[13px] text-[#8a8f98] hover:text-[#d0d6e0]"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#23252a] flex flex-col gap-2">
            <Link href="/login?redirect=/crm" className="py-2 text-center text-[13px] text-[#d0d6e0] bg-[rgba(255,255,255,0.04)] rounded-[6px]">
              Iniciar sesión
            </Link>
            <Link href="/login?redirect=/crm" className="py-2 text-center text-[13px] font-[510] text-[#08090a] bg-[#e4f222] rounded-[9999px]">
              Solicitar demo
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
