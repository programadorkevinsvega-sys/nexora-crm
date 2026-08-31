"use client"

import React from "react"
import { CheckCircle2, ShieldCheck, Zap, Layers, RefreshCw, PowerOff, Sparkles, Building2 } from "lucide-react"
import { MetaIcon } from "./meta-icon"

import { Button } from "@/src/presentation/crm/components/ui/Button"
import type { MetaIntegration } from "@crm/contracts"

interface MetaConnectCardProps {
  integration: MetaIntegration
  onConnect: () => void
  onDisconnect: () => void
  isConnecting: boolean
}

export function MetaConnectCard({
  integration,
  onConnect,
  onDisconnect,
  isConnecting,
}: MetaConnectCardProps) {
  const isConnected = integration.status === "CONNECTED"

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <MetaIcon className="h-7 w-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-100">Meta Business Suite & Facebook Lead Ads</h3>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                    isConnected
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {isConnected ? "Conectado en Vivo" : "Desconectado"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Conector nativo con la API de Meta Graph para captura de prospectos en tiempo real
              </p>
            </div>
          </div>

          {!isConnected ? (
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Ingreso de Leads en milisegundos</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>Sincronización de Formularios Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Tokens de Acceso de Larga Duración</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Creación automática de Contactos y Deals</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Página de Facebook Activa</span>
                <p className="font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-400" />
                  {integration.selectedPageName || "Nexora Enterprise Software"}
                </p>
                <span className="text-[11px] text-zinc-400 font-mono">ID: {integration.selectedPageId || "page_33445566"}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Cuenta de Anuncios (Ads)</span>
                <p className="font-semibold text-zinc-100">{integration.adAccountName || "Nexora Growth Ads"}</p>
                <span className="text-[11px] text-zinc-400 font-mono">ID: {integration.adAccountId || "act_90881122"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {!isConnected ? (
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              className="gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 shadow-lg shadow-blue-600/25"
            >
              <MetaIcon className="h-4 w-4" />
              {isConnecting ? "Conectando con Meta..." : "Conectar con Meta Business"}
            </Button>

          ) : (
            <Button
              variant="outline"
              onClick={onDisconnect}
              className="gap-2 border-rose-800/40 text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 text-xs"
            >
              <PowerOff className="h-3.5 w-3.5" />
              Desconectar Cuenta de Meta
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
