"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Users,
  Building2,
  Kanban,
  Phone,
  FileText,
  Mail,
  Zap,
  BarChart3,
  BookOpen,
  Sparkles,
  LifeBuoy,
  Plus,
  ArrowRight,
  Command,
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

  const items: CommandItem[] = useMemo(
    () => [
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
    ],
    [],
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    )
  }, [items, query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    // Expose global open helper
    ;(window as any).__openCommandPalette = () => setOpen(true)

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const executeItem = (item: CommandItem) => {
    setOpen(false)
    setQuery("")
    if (item.action) item.action()
    else if (item.href) router.push(item.href)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1))
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault()
      executeItem(filtered[selectedIndex])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#131824] to-[#0d111a] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar módulo, acción o atajo... (↑↓ para navegar, Enter para ir)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/[0.08]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No se encontraron resultados para "{query}"
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-blue-600/20 text-white border border-blue-500/30 shadow-sm"
                      : "text-slate-300 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-blue-500 text-white shadow-md shadow-blue-500/40" : "bg-white/[0.06] text-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-100">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-slate-400">{item.subtitle}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-0.5 rounded bg-white/[0.04]">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px]">↑↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px]">↵</kbd> Seleccionar
            </span>
          </div>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Command className="w-3 h-3" /> Nexora Fast Command
          </span>
        </div>
      </div>
    </div>
  )
}
