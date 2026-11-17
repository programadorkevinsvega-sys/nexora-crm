"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Building2, Users, Kanban, StickyNote, CheckSquare, Phone,
  FileText, FileSignature, Briefcase, Megaphone, Ticket, LifeBuoy, Handshake,
  Star, Settings, PanelLeftClose, PanelLeft, Zap, Flame, Package, CheckCircle2,
  Code2, Inbox as InboxIcon, Sparkles, BarChart3, BookOpen, MessageSquare,
  Globe, Camera, Smartphone, Heart, ShieldCheck, TrendingUp, FileSpreadsheet, Mail, Calendar, Layers, Award, MapPin, DollarSign, ShieldAlert, Percent, HeartHandshake,
} from "lucide-react"
import { useUIStore } from "@src/application/crm/stores/ui.store"

export interface NavItem { label: string; href: string; icon: React.ElementType; badge?: string }
export interface NavSection { title: string; items: NavItem[] }

export const navSections: NavSection[] = [
  { title: "Principal", items: [
    { label: "Dashboard", href: "/crm", icon: LayoutDashboard },
    { label: "Inbox Omnicanal", href: "/inbox", icon: InboxIcon, badge: "Live" },
    { label: "Agendamiento & Meet", href: "/booking", icon: Calendar, badge: "New" },
    { label: "Social Inbox", href: "/social-inbox", icon: MessageSquare },
    { label: "Empresas", href: "/companies", icon: Building2 },
    { label: "Contactos 360°", href: "/contacts", icon: Users },
    { label: "Pipelines & Deals", href: "/pipelines", icon: Kanban },
    { label: "Llamadas VoIP", href: "/calls", icon: Phone },
    { label: "Tareas", href: "/tasks", icon: CheckSquare },
    { label: "Notas", href: "/notes", icon: StickyNote },
    { label: "CRM Personal", href: "/personal-crm", icon: Heart },
  ]},
  { title: "Ventas & CPQ", items: [
    { label: "Catálogo & Productos", href: "/products", icon: Package },
    { label: "Listas de Precios", href: "/products/price-books", icon: DollarSign },
    { label: "Cotizaciones (CPQ)", href: "/quotes", icon: FileText },
    { label: "Aprobación Descuentos", href: "/quotes/approvals", icon: Percent },
    { label: "Contratos & Firma", href: "/contracts", icon: FileSignature },
    { label: "Aprobaciones", href: "/approvals", icon: CheckCircle2 },
    { label: "Equipos de Venta", href: "/sales-teams", icon: Briefcase },
    { label: "Territorios de Ventas", href: "/sales-teams/territories", icon: MapPin },
  ]},
  { title: "Marketing & Leads", items: [
    { label: "Campañas Masivas", href: "/campaigns", icon: Megaphone },
    { label: "Diseñador de Emails", href: "/campaigns/email-editor", icon: Mail },
    { label: "Formularios Web", href: "/forms", icon: FileText },
    { label: "Facebook Ads Leads", href: "/integrations/facebook", icon: Megaphone },
    { label: "Instagram Leads", href: "/integrations/instagram", icon: Camera },
    { label: "TikTok Ads Leads", href: "/integrations/tiktok", icon: Smartphone },
  ]},
  { title: "Soporte & Helpdesk", items: [
    { label: "Tickets de Soporte", href: "/support/tickets", icon: Ticket },
    { label: "Políticas de SLA", href: "/support/sla", icon: ShieldAlert },
    { label: "Encuestas CSAT & NPS", href: "/support/surveys", icon: HeartHandshake },
    { label: "Bandejas Helpdesk", href: "/support/helpdesk/conversations", icon: LifeBuoy },
    { label: "Agentes Helpdesk", href: "/support/helpdesk/settings/agents", icon: Users },
    { label: "Buzones de Soporte", href: "/support/helpdesk/settings/mailboxes", icon: InboxIcon },
    { label: "Base de Conocimiento", href: "/kb", icon: BookOpen },
    { label: "Portal de Clientes", href: "/portal", icon: Globe },
  ]},
  { title: "Automatización & IA", items: [
    { label: "Copiloto IA & RAG", href: "/ai", icon: Sparkles, badge: "IA" },
    { label: "Automatizaciones", href: "/automations", icon: Zap },
    { label: "Diseñador de Flujos", href: "/automations/new", icon: Kanban },
    { label: "Lead Scoring", href: "/scoring", icon: Flame },
  ]},
  { title: "Analítica & Finanzas", items: [
    { label: "Métricas Financieras", href: "/analytics", icon: BarChart3 },
    { label: "Comisiones SPM", href: "/commissions", icon: Award, badge: "SPM" },
    { label: "Power BI & BI Hub", href: "/analytics/bi", icon: Layers, badge: "BI" },
    { label: "Forecasting Predictivo", href: "/analytics/forecast", icon: TrendingUp },
    { label: "Reportes a Medida", href: "/analytics/reports", icon: FileSpreadsheet },
  ]},
  { title: "Fidelización & Afiliados", items: [
    { label: "Programa de Puntos", href: "/loyalty", icon: Star },
    { label: "Segmentos de Clientes", href: "/loyalty/segments", icon: Users },
    { label: "Portal de Partners (PRM)", href: "/partners", icon: Handshake, badge: "PRM" },
    { label: "Red de Afiliados", href: "/affiliates", icon: Handshake },
    { label: "Programas de Comisión", href: "/affiliates/programs", icon: Briefcase },
  ]},
  { title: "Config & Devs", items: [
    { label: "Hub Integraciones", href: "/integrations", icon: Globe },
    { label: "Deduplicación & Limpieza", href: "/settings/deduplication", icon: Layers },
    { label: "Registro de Auditoría", href: "/audit", icon: ShieldCheck },
    { label: "Seguridad & Accesos", href: "/settings/security-audit", icon: ShieldAlert },
    { label: "API Keys & Webhooks", href: "/settings/developer", icon: Code2 },
    { label: "Etiquetas / Tags", href: "/settings/tags", icon: Flame },
    { label: "Perfil de Usuario", href: "/settings/profile", icon: Heart },
    { label: "Configuración General", href: "/settings", icon: Settings },
  ]},
]

export function CrmSidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={`flex flex-col bg-background border-r border-border transition-all duration-200 z-30 select-none ${
        sidebarCollapsed ? "w-14" : "w-60"
      }`}
    >
      {/* Brand */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-[7px] w-[7px] rounded-[1px] bg-primary" />
            <span className="text-[13px] font-[510] tracking-[-0.011em] text-foreground">NEXORA</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex h-6 w-6 items-center justify-center rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title={sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {sidebarCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-1">
            {!sidebarCollapsed && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-[510] uppercase tracking-[0.06em] text-muted-foreground select-none">
                {section.title}
              </p>
            )}
            <ul className="space-y-px px-1.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = item.href === "/crm" ? pathname === "/crm" : pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex items-center justify-between rounded-[6px] px-2.5 py-1.5 text-[13px] font-[400] transition-all ${
                        isActive
                          ? "bg-accent text-accent-foreground border border-border shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge && (
                        <span className={`text-[10px] font-[510] font-mono px-1.5 rounded-[3px] ${
                          item.badge === "IA"
                            ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
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
