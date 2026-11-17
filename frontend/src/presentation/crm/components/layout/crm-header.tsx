"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronDown, Plus, Sparkles, LogOut, CheckCircle2 } from "lucide-react"
import { useSession } from "@src/infrastructure/auth/auth-provider"
import { AuthService } from "@src/infrastructure/auth/auth.service"
import { ThemeToggle } from "@/src/presentation/crm/components/common/theme-toggle"

export function CrmHeader() {
  const { session, clear } = useSession()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const handleLogout = async () => {
    try { await AuthService.logout() } catch (e) { console.error("Error logging out", e) }
    finally { clear(); router.push("/login") }
  }

  const openCmd = () => {
    if (typeof window !== "undefined" && (window as any).__openCommandPalette) {
      ;(window as any).__openCommandPalette()
    }
  }

  const menuItemCls = "w-full text-left px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-[6px] transition-colors"
  const dropdownCls = "absolute right-0 mt-1.5 rounded-[12px] border border-border bg-popover text-popover-foreground shadow-xl z-40 animate-in fade-in zoom-in-95 duration-100"

  return (
    <header className="flex h-12 items-center justify-between bg-background px-4 border-b border-border relative z-20 select-none">
      {/* Search / Command palette trigger */}
      <button
        onClick={openCmd}
        className="flex items-center gap-2 rounded-[6px] bg-muted/40 hover:bg-muted/70 px-3 h-7 text-muted-foreground hover:text-foreground border border-border transition-all text-[13px] w-64 justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Search size={13} />
          <span>Buscar o saltar a...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center px-1 text-[11px] font-mono text-muted-foreground bg-muted rounded-[3px] border border-border/50">
          ⌘K
        </kbd>
      </button>

      {/* Right Toolbar */}
      <div className="flex items-center gap-2">
        {/* Quick Create — acid-lime CTA */}
        <div className="relative">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="flex items-center gap-1.5 px-3 h-7 bg-primary hover:opacity-90 text-primary-foreground rounded-[6px] text-[13px] font-[510] tracking-[-0.011em] transition-all cursor-pointer shadow-xs"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Crear</span>
            <ChevronDown size={11} className="opacity-60" />
          </button>
          {quickCreateOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setQuickCreateOpen(false)} />
              <div className={`${dropdownCls} w-48 p-1.5`}>
                {[
                  { label: "Nuevo Contacto", href: "/contacts" },
                  { label: "Nueva Oportunidad", href: "/pipelines/deals/new" },
                  { label: "Nueva Cotización", href: "/quotes/new" },
                  { label: "Nuevo Ticket", href: "/support/tickets/new" },
                ].map((item) => (
                  <button key={item.href} onClick={() => { setQuickCreateOpen(false); router.push(item.href) }} className={menuItemCls}>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* AI Copilot */}
        <button
          onClick={() => router.push("/ai")}
          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          title="Copiloto IA"
        >
          <Sparkles size={14} />
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Bell size={14} />
            <span className="absolute top-1.5 right-1.5 size-1.5 bg-primary rounded-full" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className={`${dropdownCls} w-72 p-3 space-y-2`}>
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <p className="text-[13px] font-[510] text-foreground">Notificaciones</p>
                  <span className="text-[11px] text-primary font-mono">3 nuevas</span>
                </div>
                <div className="space-y-1 text-[13px]">
                  <div className="p-2 rounded-[6px] hover:bg-muted/60 flex items-start gap-2 cursor-pointer">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-[510] text-[12px]">Cotización Aprobada</p>
                      <p className="text-[11px] text-muted-foreground">Cliente aceptó propuesta #Q-104</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-[6px] hover:bg-muted/60 flex items-start gap-2 cursor-pointer">
                    <Sparkles size={13} className="text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-[510] text-[12px]">Nuevo Lead Scoring</p>
                      <p className="text-[11px] text-muted-foreground">Prospecto asignado con score 92%</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <div onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-1.5 px-2 h-7 rounded-[6px] hover:bg-muted/60 transition-colors cursor-pointer">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-[510] text-foreground border border-border">
              {session?.userName?.charAt(0).toUpperCase() ?? session?.userEmail?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <ChevronDown size={11} className="text-muted-foreground" />
          </div>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
              <div className={`${dropdownCls} w-52 p-1.5`}>
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="font-[510] text-[13px] text-foreground truncate">{session?.userName ?? "Usuario"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{session?.userEmail ?? ""}</p>
                </div>
                <button onClick={() => { setProfileOpen(false); router.push("/settings/profile") }} className={menuItemCls}>Mi Perfil & Ajustes</button>
                <button onClick={() => { setProfileOpen(false); router.push("/settings/developer") }} className={menuItemCls}>API Keys & Webhooks</button>
                <div className="my-1 border-t border-border" />
                <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-[6px] px-3 py-1.5 text-left text-[13px] text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut size={13} />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
