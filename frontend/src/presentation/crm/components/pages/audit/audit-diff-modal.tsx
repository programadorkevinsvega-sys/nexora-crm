"use client"

import { X, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import type { AuditLogItem } from "@/src/infrastructure/crm/repositories/audit/api-audit.repository"

interface AuditDiffModalProps {
  log: AuditLogItem
  onClose: () => void
}

export function AuditDiffModal({ log, onClose }: AuditDiffModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <Card className="w-full max-w-xl bg-card border shadow-xl p-6 space-y-4 relative">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Detalle de Auditoría #{log.id.slice(0, 8)}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 bg-muted/20 rounded border">
            <span className="text-muted-foreground block text-[11px]">Acción Ejecutada</span>
            <span className="font-bold text-foreground">{log.action}</span>
          </div>
          <div className="p-2 bg-muted/20 rounded border">
            <span className="text-muted-foreground block text-[11px]">Fecha & Hora</span>
            <span className="font-mono text-foreground">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
          <div className="p-2 bg-muted/20 rounded border">
            <span className="text-muted-foreground block text-[11px]">Módulo / Entidad</span>
            <span className="font-mono text-foreground">{log.moduleName || log.entityType}</span>
          </div>
          <div className="p-2 bg-muted/20 rounded border">
            <span className="text-muted-foreground block text-[11px]">Dirección IP Origen</span>
            <span className="font-mono text-foreground">{log.ipAddress || "127.0.0.1"}</span>
          </div>
        </div>

        {/* Diff Display */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-foreground">Transformación de Datos:</span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
              <span className="text-[10px] font-bold uppercase block text-rose-500 mb-1">Valor Anterior (Old)</span>
              <pre className="font-mono text-[11px] whitespace-pre-wrap break-all">
                {log.oldValue ? String(log.oldValue) : "— [Sin valor previo]"}
              </pre>
            </div>
            <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <span className="text-[10px] font-bold uppercase block text-emerald-500 mb-1">Valor Nuevo (New)</span>
              <pre className="font-mono text-[11px] whitespace-pre-wrap break-all">
                {log.newValue ? String(log.newValue) : "— [Sin valor nuevo]"}
              </pre>
            </div>
          </div>
        </div>

        {/* Metadata */}
        {log.metadataJson && Object.keys(log.metadataJson).length > 0 && (
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-foreground">Metadatos de la Petición:</span>
            <pre className="p-2.5 bg-muted/30 rounded border text-[11px] font-mono text-muted-foreground overflow-x-auto">
              {JSON.stringify(log.metadataJson, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  )
}
