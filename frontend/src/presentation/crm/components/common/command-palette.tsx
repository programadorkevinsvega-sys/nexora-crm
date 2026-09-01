"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Users, Building2, Kanban, Phone, FileText, Mail, Zap, BarChart3,
  BookOpen, Sparkles, LifeBuoy, Plus, ArrowRight, Command,
} from "lucide-react"

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  category: "Navegación" | "Acciones Rápidas" | "Inteligencia Artificial"
  icon: React.ElementType
  href?: string
  action?: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const items: CommandItem[] = useMemo(() => [
    { id: "ai-copilot", title: "Preguntar al Copiloto IA", subtitle: "Asistente inteligente", category: "Inteligencia Artificial", icon: Sparkles, href: "/ai" },
    { id: "new-contact", title: "Crear Nuevo Contacto", subtitle: "Añadir lead o prospecto", category: "Acciones Rápidas", icon: Plus, href: "/contacts" },
    { id: "new-deal", title: "Crear Oportunidad / Deal", subtitle: "Añadir negocio al pipeline", category: "Acciones Rápidas", icon: Plus, href: "/pipelines/deals/new" },
    { id: "new-quote", title: "Crear Cotización CPQ", subtitle: "Generar propuesta comercial", category: "Acciones Rápidas", icon: Plus, href: "/quotes/new" },
    { id: "new-contract", title: "Crear Contrato", subtitle: "Generar contrato con firma", category: "Acciones Rápidas", icon: Plus, href: "/contracts/new" },
    { id: "email-editor", title: "Diseñador de Emails", subtitle: "Editor Drag-and-Drop", category: "Acciones Rápidas", icon: Mail, href: "/campaigns/email-editor" },
    { id: "nav-crm", title: "Dashboard Principal", subtitle: "Métricas y resumen", category: "Navegación", icon: BarChart3, href: "/crm" },
    { id: "nav-contacts", title: "Contactos 360°", subtitle: "Vista integral de clientes", category: "Navegación", icon: Users, href: "/contacts" },
    { id: "nav-companies", title: "Empresas & Cuentas", subtitle: "Directorio B2B", category: "Navegación", icon: Building2, href: "/companies" },
    { id: "nav-pipelines", title: "Pipelines & Kanban", subtitle: "Embudo de ventas", category: "Navegación", icon: Kanban, href: "/pipelines" },
    { id: "nav-calls", title: "Registro de Llamadas", subtitle: "Historial y grabaciones VoIP", category: "Navegación", icon: Phone, href: "/calls" },
    { id: "nav-quotes", title: "Cotizaciones", subtitle: "Listado de propuestas", category: "Navegación", icon: FileText, href: "/quotes" },
    { id: "nav-automations", title: "Automatizaciones", subtitle: "Flujos y triggers", category: "Navegación", icon: Zap, href: "/automations" },
    { id: "nav-forecast", title: "Forecasting Predictivo", subtitle: "Proyección de ingresos", category: "Navegación", icon: BarChart3, href: "/analytics/forecast" },
    { id: "nav-helpdesk", title: "Bandeja Helpdesk", subtitle: "Conversaciones de soporte", category: "Navegación", icon: LifeBuoy, href: "/support/helpdesk/conversations" },
    { id: "nav-kb", title: "Base de Conocimiento", subtitle: "Artículos y archivos RAG", category: "Navegación", icon: BookOpen, href: "/kb" },
  ], [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q),
    )
  }, [items, query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((prev) => !prev) }
      if (e.key === "Escape") setOpen(false)
    }
    ;(window as any).__openCommandPalette = () => setOpen(true)
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => { setSelectedIndex(0) }, [query])

  const executeItem = (item: CommandItem) => {
    setOpen(false); setQuery("")
    if (item.action) item.action()
    else if (item.href) router.push(item.href)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1)) }
    else if (e.key === "Enter" && filtered[selectedIndex]) { e.preventDefault(); executeItem(filtered[selectedIndex]) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-[560px] bg-[#161718] border border-[#23252a] rounded-[12px] shadow-[rgba(8,9,10,0.6)_0px_4px_32px_0px] overflow-hidden z-10 animate-in zoom-in-95 duration-100">
        {/* Input */}
        <div className="flex items-center gap-2.5 px-4 border-b border-[#23252a]">
          <Search size={14} className="text-[#62666d] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar módulo, acción o atajo..."
            className="w-full bg-transparent py-3.5 text-[15px] font-[400] text-[#d0d6e0] placeholder:text-[#62666d] outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono text-[#62666d] bg-[rgba(255,255,255,0.05)] rounded-[3px]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-[#62666d]">
              Sin resultados para &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-left transition-all ${
                    isSelected
                      ? "bg-[rgba(255,255,255,0.06)] text-[#d0d6e0] shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]"
                      : "text-[#8a8f98] hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className={isSelected ? "text-[#d0d6e0]" : "text-[#62666d]"} />
                    <div>
                      <p className="text-[13px] font-[400] leading-[1.4]">{item.title}</p>
                      {item.subtitle && <p className="text-[11px] text-[#62666d]">{item.subtitle}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-[510] text-[#62666d] px-1.5 py-0.5 rounded-[3px] bg-[rgba(255,255,255,0.04)]">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={12} className="text-[#d0d6e0]" />}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#23252a] flex items-center justify-between text-[11px] text-[#62666d]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded-[3px] bg-[rgba(255,255,255,0.05)] font-mono">↑↓</kbd> Navegar</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded-[3px] bg-[rgba(255,255,255,0.05)] font-mono">↵</kbd> Abrir</span>
          </div>
          <span className="flex items-center gap-1 font-mono"><Command size={10} /> Nexora</span>
        </div>
      </div>
    </div>
  )
}
