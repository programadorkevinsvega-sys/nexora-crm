"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  StickyNote,
  CheckSquare,
  Phone,
  FileText,
  FileSignature,
  Briefcase,
  Megaphone,
  Ticket,
  LifeBuoy,
  Handshake,
  Star,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Zap,
  Flame,
  Package,
  CheckCircle2,
  Code2,
  Inbox as InboxIcon,
  Sparkles,
  BarChart3,
  BookOpen,
  MessageSquare,
  Globe,
  Camera,
  Smartphone,
  Heart,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Mail,
} from "lucide-react"
import { useUIStore } from "@src/application/crm/stores/ui.store"

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { label: "Dashboard", href: "/crm", icon: LayoutDashboard },
      { label: "Inbox Omnicanal", href: "/inbox", icon: InboxIcon, badge: "Live" },
      { label: "Social Inbox", href: "/social-inbox", icon: MessageSquare },
      { label: "Empresas", href: "/companies", icon: Building2 },
      { label: "Contactos 360°", href: "/contacts", icon: Users },
      { label: "Pipelines & Deals", href: "/pipelines", icon: Kanban },
      { label: "Llamadas VoIP", href: "/calls", icon: Phone },
      { label: "Tareas", href: "/tasks", icon: CheckSquare },
      { label: "Notas", href: "/notes", icon: StickyNote },
      { label: "CRM Personal", href: "/personal-crm", icon: Heart },
    ],
  },
  {
    title: "Ventas & CPQ",
    items: [
      { label: "Catálogo & Productos", href: "/products", icon: Package },
      { label: "Cotizaciones (CPQ)", href: "/quotes", icon: FileText },
      { label: "Contratos & Firma", href: "/contracts", icon: FileSignature },
      { label: "Aprobaciones", href: "/approvals", icon: CheckCircle2 },
      { label: "Equipos de Venta", href: "/sales-teams", icon: Briefcase },
    ],
  },
  {
    title: "Marketing & Leads",
    items: [
      { label: "Campañas Masivas", href: "/campaigns", icon: Megaphone },
      { label: "Diseñador de Emails", href: "/campaigns/email-editor", icon: Mail },
      { label: "Formularios Web", href: "/forms", icon: FileText },
      { label: "Facebook Ads Leads", href: "/integrations/facebook", icon: Megaphone },
      { label: "Instagram Leads", href: "/integrations/instagram", icon: Camera },
      { label: "TikTok Ads Leads", href: "/integrations/tiktok", icon: Smartphone },
    ],
  },
  {
    title: "Soporte & Helpdesk",
    items: [
      { label: "Tickets de Soporte", href: "/support/tickets", icon: Ticket },
      { label: "Bandejas Helpdesk", href: "/support/helpdesk/conversations", icon: LifeBuoy },
      { label: "Agentes Helpdesk", href: "/support/helpdesk/settings/agents", icon: Users },
      { label: "Buzones de Soporte", href: "/support/helpdesk/settings/mailboxes", icon: InboxIcon },
      { label: "Base de Conocimiento", href: "/kb", icon: BookOpen },
      { label: "Portal de Clientes", href: "/portal", icon: Globe },
    ],
  },
  {
    title: "Automatización & IA",
    items: [
      { label: "Copiloto IA & RAG", href: "/ai", icon: Sparkles, badge: "IA" },
      { label: "Automatizaciones", href: "/automations", icon: Zap },
      { label: "Diseñador de Flujos", href: "/automations/new", icon: Kanban },
      { label: "Lead Scoring", href: "/scoring", icon: Flame },
    ],
  },
  {
    title: "Analítica & Finanzas",
    items: [
      { label: "Métricas Financieras", href: "/analytics", icon: BarChart3 },
      { label: "Forecasting Predictivo", href: "/analytics/forecast", icon: TrendingUp },
      { label: "Reportes a Medida", href: "/analytics/reports", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Fidelización & Afiliados",
    items: [
      { label: "Programa de Puntos", href: "/loyalty", icon: Star },
      { label: "Segmentos de Clientes", href: "/loyalty/segments", icon: Users },
      { label: "Red de Afiliados", href: "/affiliates", icon: Handshake },
      { label: "Programas de Comisión", href: "/affiliates/programs", icon: Briefcase },
    ],
  },
  {
    title: "Configuración & Devs",
    items: [
      { label: "Hub Integraciones", href: "/integrations", icon: Globe },
      { label: "Registro de Auditoría", href: "/audit", icon: ShieldCheck },
      { label: "API Keys & Webhooks", href: "/settings/developer", icon: Code2 },
      { label: "Etiquetas / Tags", href: "/settings/tags", icon: Flame },
      { label: "Perfil de Usuario", href: "/settings/profile", icon: Heart },
      { label: "Configuración General", href: "/settings", icon: Settings },
    ],
  },
]

export function CrmSidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={`flex flex-col bg-[#0b0e14] border-r border-white/[0.08] transition-all duration-200 z-30 select-none ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-white/[0.06] bg-white/[0.01]">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30 text-white font-bold text-xs">
              N
            </div>
            <span className="text-sm font-bold tracking-wider text-slate-100">NEXORA</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title={sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Nav items list */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/crm"
                    ? pathname === "/crm"
                    : pathname.startsWith(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/25 shadow-sm font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent"
                      } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? "text-blue-400" : "text-slate-400"} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          item.badge === "IA" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-blue-500/20 text-blue-300"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
