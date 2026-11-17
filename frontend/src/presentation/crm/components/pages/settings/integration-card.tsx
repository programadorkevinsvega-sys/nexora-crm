"use client"

import React from "react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { CheckCircle2, Settings, ExternalLink } from "lucide-react"
import Link from "next/link"

export interface IntegrationCardProps {
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  iconColorClass?: string
  isConfigured: boolean
  onConfigure?: () => void
  configureLabel?: string
  externalLink?: string
}

export function IntegrationCard({
  title,
  subtitle,
  description,
  icon,
  iconColorClass = "text-blue-500 bg-blue-500/10 border-blue-500/20",
  isConfigured,
  onConfigure,
  configureLabel,
  externalLink,
}: IntegrationCardProps) {
  return (
    <Card className="p-5 flex flex-col justify-between space-y-4 hover:border-border/80 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconColorClass}`}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">{subtitle}</span>
          </div>
        </div>

        {isConfigured ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 size={11} /> Conectado
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            Sin Configurar
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>

      <div className="pt-2 border-t border-border flex justify-end">
        {externalLink ? (
          <Link href={externalLink}>
            <Button size="sm" className="text-xs gap-1.5 h-7">
              <ExternalLink size={12} /> {configureLabel || "Administrar Conector"}
            </Button>
          </Link>
        ) : (
          <Button onClick={onConfigure} size="sm" className="text-xs gap-1.5 h-7">
            <Settings size={12} /> {configureLabel || (isConfigured ? "Editar Configuración" : "Conectar")}
          </Button>
        )}
      </div>
    </Card>
  )
}
