"use client"

import React, { useState, useEffect } from "react"
import { Camera, Sparkles, ArrowRight, ShieldCheck, Zap, MessageSquare } from "lucide-react"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { ApiMetaLeadsRepository } from "@/src/infrastructure/crm/repositories/meta-leads/api-meta-leads.repository"
import Link from "next/link"

export function InstagramLeadsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [pageName, setPageName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ApiMetaLeadsRepository.getStatus()
      .then((data) => {
        setIsConnected(data?.status === "CONNECTED")
        setPageName(data?.selectedPageName || null)
      })
      .catch(() => setIsConnected(false))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Instagram for Business & Lead Generation"
        description="Conecta tus anuncios de Historias, Reels y Feed de Instagram mediante el ecosistema de Meta Business Suite."
        actions={
          <Link href="/integrations/facebook">
            <Button variant="default" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {isConnected ? "Gestionar en Panel Meta" : "Conectar Instagram con Meta"}
            </Button>
          </Link>
        }
      />

      {/* Main Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">Instagram Lead Ads & Direct Messenger</h3>
                  <Badge variant={isConnected ? "success" : "default"}>
                    {isConnected ? "Sincronizado vía Meta" : "Sin Conectar"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isConnected
                    ? `Vinculado a la página comercial: ${pageName || "Instagram Business"}`
                    : "Requiere vincular tu cuenta de Instagram a tu Página de Facebook"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-pink-500" />
                <span>Captura en Reels e Historias</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                <span>Creación automática de Deals</span>
              </div>
            </div>
          </div>

          <Link href="/integrations/facebook">
            <Button variant="default" className="gap-2">
              Abrir Conector de Meta <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Camera className="h-4 w-4 text-pink-500" />
            1. Vincular Instagram con Facebook
          </h4>
          <p className="text-xs text-muted-foreground">
            Asegúrate de que tu perfil de Instagram esté configurado como <strong>Cuenta Profesional</strong> y vinculado a tu <strong>Página de Facebook</strong> en Meta Business Suite.
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-500" />
            2. Formularios de Clientes Potenciales
          </h4>
          <p className="text-xs text-muted-foreground">
            Todos los formularios de anuncios instantáneos publicados en Instagram se sincronizan automáticamente con el conector de Meta del CRM.
          </p>
        </Card>
      </div>
    </div>
  )
}
