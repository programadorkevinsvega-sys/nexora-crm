"use client"

import React from "react"
import { CheckCircle2, ShieldCheck, Zap, Layers, PowerOff, Sparkles, Building2 } from "lucide-react"
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
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
              <MetaIcon className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Meta Business Suite & Facebook Lead Ads</h3>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                    isConnected
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isConnected ? "Conectado en Vivo" : "Desconectado"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Conector nativo con la API de Meta Graph para captura de prospectos en tiempo real
              </p>
            </div>
          </div>

          {!isConnected ? (
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>Ingreso de Leads en milisegundos</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>Sincronización de Formularios Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Tokens de Acceso de Larga Duración</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <span>Creación automática de Contactos y Deals</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted border border-border space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Página de Facebook Activa</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  {integration.selectedPageName || "Página Conectada"}
                </p>
                {integration.selectedPageId && (
                  <span className="text-[11px] text-muted-foreground font-mono">ID: {integration.selectedPageId}</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-muted border border-border space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Cuenta de Anuncios (Ads)</span>
                <p className="font-semibold text-foreground">{integration.adAccountName || "Cuenta de Anuncios Activa"}</p>
                {integration.adAccountId && (
                  <span className="text-[11px] text-muted-foreground font-mono">ID: {integration.adAccountId}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {!isConnected ? (
            <Button
              variant="default"
              onClick={onConnect}
              disabled={isConnecting}
              className="gap-2.5 font-semibold px-5 py-3"
            >
              <MetaIcon className="h-4 w-4" />
              {isConnecting ? "Conectando con Meta..." : "Conectar con Meta Business"}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={onDisconnect}
              className="gap-2 text-xs"
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
