"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/src/presentation/crm/components/common/theme-toggle"

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
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-2xs"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-[2px] bg-primary" />
          <span className="text-[15px] font-[510] tracking-tight text-foreground">NEXORA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-[13px] font-[400] text-muted-foreground hover:text-foreground transition-colors rounded-[6px] hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login?redirect=/crm"
            className="px-3 py-1.5 text-[13px] font-[400] text-muted-foreground hover:text-foreground rounded-[6px] hover:bg-muted transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login?redirect=/crm"
            className="px-4 py-1.5 text-[13px] font-[510] tracking-[-0.011em] text-primary-foreground bg-primary hover:opacity-90 rounded-[9999px] transition-opacity shadow-xs"
          >
            Solicitar demo
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pt-2 pb-5 space-y-1 shadow-md">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[13px] text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href="/login?redirect=/crm"
              className="py-2 text-center text-[13px] text-foreground bg-muted rounded-[6px]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login?redirect=/crm"
              className="py-2 text-center text-[13px] font-[510] text-primary-foreground bg-primary rounded-[9999px]"
            >
              Solicitar demo
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
