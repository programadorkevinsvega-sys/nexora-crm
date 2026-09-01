"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronDown, Plus, Sparkles, LogOut, CheckCircle2 } from "lucide-react"
import { useSession } from "@src/infrastructure/auth/auth-provider"
import { AuthService } from "@src/infrastructure/auth/auth.service"

export function CrmHeader() {
  const { session, clear } = useSession()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

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

  const openCmd = () => {
    if (typeof window !== "undefined" && (window as any).__openCommandPalette) {
      ;(window as any).__openCommandPalette()
    }
  }

  return (
    <header className="flex h-14 items-center justify-between bg-[#0e121a] px-6 border-b border-white/[0.08] relative z-20 select-none">
      {/* Search / Command palette trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={openCmd}
          className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] px-3 py-1.5 text-slate-400 hover:text-slate-200 border border-white/[0.06] transition-all text-xs w-56 sm:w-72 justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-blue-400" />
            <span>Buscar o saltar a...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/[0.08]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Toolbar */}
      <div className="flex items-center gap-3">
        {/* Quick Create Button */}
        <div className="relative">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 border border-blue-400/30 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Crear</span>
            <ChevronDown size={12} className="opacity-70" />
          </button>

          {quickCreateOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setQuickCreateOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#121622] p-1.5 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setQuickCreateOpen(false); router.push("/contacts") }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={13} className="text-blue-400" /> Nuevo Contacto
                </button>
                <button
                  onClick={() => { setQuickCreateOpen(false); router.push("/pipelines/deals/new") }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={13} className="text-emerald-400" /> Nueva Oportunidad
                </button>
                <button
                  onClick={() => { setQuickCreateOpen(false); router.push("/quotes/new") }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={13} className="text-amber-400" /> Nueva Cotización
                </button>
                <button
                  onClick={() => { setQuickCreateOpen(false); router.push("/support/tickets/new") }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={13} className="text-purple-400" /> Nuevo Ticket
                </button>
              </div>
            </>
          )}
        </div>

        {/* AI Copilot shortcut button */}
        <button
          onClick={() => router.push("/ai")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 transition-colors"
          title="Abrir Copiloto IA"
        >
          <Sparkles size={15} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Notificaciones"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 size-2 bg-blue-500 rounded-full animate-pulse" />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#121622] p-3 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-100 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <p className="text-xs font-semibold text-slate-100">Notificaciones en vivo</p>
                  <span className="text-[10px] text-blue-400 font-mono">3 nuevas</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 font-medium text-[11px]">Cotización Aprobada</p>
                      <p className="text-[10px] text-slate-400">Cliente aceptó la propuesta #Q-104</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-start gap-2">
                    <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 font-medium text-[11px]">Nuevo Lead Scoring</p>
                      <p className="text-[10px] text-slate-400">Prospecto asignado con score 92%</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {session?.userName ? session.userName.charAt(0).toUpperCase() : (session?.userEmail ? session.userEmail.charAt(0).toUpperCase() : "U")}
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </div>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#121622] p-2 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                  <p className="font-semibold text-xs text-slate-100 truncate">{session?.userName || "Usuario"}</p>
                  <p className="text-[11px] text-blue-400 truncate">{session?.companyName || "Nexora CRM"}</p>
                  {session?.userEmail && <p className="text-[10px] text-slate-400 truncate">{session.userEmail}</p>}
                </div>
                <button
                  onClick={() => { setProfileOpen(false); router.push("/settings/profile") }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  Mi Perfil & Ajustes
                </button>
                <button
                  onClick={() => { setProfileOpen(false); router.push("/settings/developer") }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  API Keys & Webhooks
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={13} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
