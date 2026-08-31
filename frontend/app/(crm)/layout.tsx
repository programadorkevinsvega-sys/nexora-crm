"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
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
  Search,
  Bell,
  ChevronDown,
  Zap,
  Flame,
  Package,
  CheckCircle2,
  Code2,
  Inbox as InboxIcon,
  Sparkles,
  BarChart3,
  BookOpen,
  Heart,
  ShieldCheck,
} from "lucide-react"
import { useUIStore } from "@src/application/crm/stores/ui.store"
import { AuthProvider, useSession } from "@src/infrastructure/auth/auth-provider"
import { ErrorBoundary } from "@src/presentation/components/error-boundary"
import { Toaster } from "@src/presentation/components/toast"
import { registerDependencies } from "@src/application/crm/di/register"
import { AuthService } from "@src/infrastructure/auth/auth.service"

registerDependencies()

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Core",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Inbox", href: "/inbox", icon: InboxIcon },
      { label: "Companies", href: "/companies", icon: Building2 },
      { label: "Contacts", href: "/contacts", icon: Users },
      { label: "Personal CRM", href: "/personal-crm", icon: Heart },
      { label: "Pipelines", href: "/pipelines", icon: Kanban },
      { label: "Notes", href: "/notes", icon: StickyNote },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Calls", href: "/calls", icon: Phone },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Products & CPQ", href: "/products", icon: Package },
      { label: "Approvals", href: "/approvals", icon: CheckCircle2 },
      { label: "Quotes", href: "/quotes", icon: FileText },
      { label: "Contracts", href: "/contracts", icon: FileSignature },
      { label: "Sales Teams", href: "/sales-teams", icon: Briefcase },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone },
      { label: "Formularios Web", href: "/forms", icon: FileText },
    ],
  },

  {
    title: "Support",
    items: [
      { label: "Tickets", href: "/support/tickets", icon: Ticket },
      { label: "Helpdesk", href: "/support/helpdesk/conversations", icon: LifeBuoy },
      { label: "Knowledge Base", href: "/kb", icon: BookOpen },
    ],
  },
  {
    title: "Automation & AI",
    items: [
      { label: "AI Copilot", href: "/ai", icon: Sparkles },
      { label: "Automations", href: "/automations", icon: Zap },
      { label: "Lead Scoring", href: "/scoring", icon: Flame },
    ],
  },
  {
    title: "Other",
    items: [
      { label: "Affiliates", href: "/affiliates", icon: Handshake },
      { label: "Loyalty", href: "/loyalty", icon: Star },
      { label: "Auditoría", href: "/audit", icon: ShieldCheck },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Developer", href: "/settings/developer", icon: Code2 },
    ],
  },
]

function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={`rekki-inset flex flex-col bg-carbon transition-all duration-200 ${
        sidebarCollapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold tracking-wide text-foreground">REKKI CRM</span>
        )}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ash hover:text-foreground hover:bg-iron transition-colors"
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-2">
        {navSections.map((section) => (
          <div key={section.title}>
            {!sidebarCollapsed && (
              <p className="px-2 pb-1 text-caption font-medium uppercase tracking-wider text-ash">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-iron text-signal-blue"
                          : "text-ash hover:text-foreground hover:bg-iron"
                      } ${sidebarCollapsed ? "justify-center" : ""}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
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

function Header() {
  const { session, clear } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await AuthService.logout()
    } catch (e) {
      console.error("Error logging out", e)
    } finally {
      clear()
      router.push("/login")
    }
  }

  return (
    <header className="rekki-inset flex h-14 items-center justify-between bg-carbon px-6 relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-iron px-3 py-1.5 text-ash">
          <Search size="16" />
          <span className="text-sm">Search...</span>
        </div>
      </div>
      <div className="flex items-center gap-3 relative">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ash hover:text-foreground hover:bg-iron transition-colors">
          <Bell size={18} />
        </button>
        
        {menuOpen && (
          <div 
            className="fixed inset-0 z-30 cursor-default" 
            onClick={() => setMenuOpen(false)} 
          />
        )}

        <div className="relative z-40">
          <div 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-iron transition-colors cursor-pointer select-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-signal-blue text-xs font-bold text-paper">
              {session?.userName ? session.userName.charAt(0).toUpperCase() : (session?.userEmail ? session.userEmail.charAt(0).toUpperCase() : "U")}
            </div>
            <ChevronDown size={14} className="text-ash" />
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-steel bg-iron p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-3 py-2 text-caption text-ash border-b border-steel/50">
                <p className="font-semibold text-paper truncate">{session?.userName || session?.userEmail || "Usuario"}</p>
                <p className="text-[11px] text-signal-blue truncate">{session?.companyName || "Nexora CRM"}</p>
                {session?.userEmail && <p className="text-[10px] text-ash truncate">{session.userEmail}</p>}
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-obsidian/50 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function CrmShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-obsidian text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <CrmShell>{children}</CrmShell>
          <Toaster />
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
