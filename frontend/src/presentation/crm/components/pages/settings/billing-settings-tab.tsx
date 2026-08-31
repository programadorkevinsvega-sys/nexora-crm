'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { ApiContactRepository } from '@/src/infrastructure/crm/repositories/contacts/api-contact.repository'
import { CreditCard, Zap, Users, Activity, HardDrive, ShieldCheck } from 'lucide-react'

export function BillingSettingsTab() {
  const { session } = useSession()
  const [contactCount, setContactCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ApiContactRepository.list({}, { limit: 1 })
      .then((res) => {
        setContactCount(res.total ?? 0)
      })
      .catch(() => setContactCount(0))
      .finally(() => setLoading(false))
  }, [])

  const contactLimit = 50000
  const contactPercent = Math.min(100, (contactCount / contactLimit) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card className="p-6 bg-gradient-to-br from-graphite to-obsidian border-steel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-steel/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-signal-blue/20 text-signal-blue border border-signal-blue/30 uppercase tracking-wider">
                Plan Activo
              </span>
              <h3 className="text-xl font-bold text-paper">Nexus Enterprise Cloud</h3>
            </div>
            <p className="text-xs text-ash">
              Tenant: <code className="text-paper bg-obsidian px-1 py-0.5 rounded font-mono">{session?.companyName || session?.tenantId || 'CRM'}</code> • Licencia ilimitada de producción
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck size={16} /> Estado al Día
            </span>
          </div>
        </div>

        {/* Real Dynamic Quotas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-4 rounded-xl bg-obsidian border border-steel/60 space-y-2">
            <div className="flex items-center justify-between text-ash">
              <span className="flex items-center gap-1.5"><Users size={14} className="text-signal-blue" /> Contactos Reales</span>
              <span className="font-semibold text-paper">
                {loading ? '…' : `${contactCount.toLocaleString()} / ${contactLimit.toLocaleString()}`}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-steel/40 overflow-hidden">
              <div className="h-full bg-signal-blue rounded-full" style={{ width: `${Math.max(2, Number(contactPercent))}%` }} />
            </div>
            <p className="text-[11px] text-ash">{contactPercent}% de capacidad utilizada</p>
          </div>

          <div className="p-4 rounded-xl bg-obsidian border border-steel/60 space-y-2">
            <div className="flex items-center justify-between text-ash">
              <span className="flex items-center gap-1.5"><Activity size={14} className="text-emerald-400" /> API Calls & MCP</span>
              <span className="font-semibold text-paper">Ilimitado</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-steel/40 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
            </div>
            <p className="text-[11px] text-ash">Sin límite de tasa en tu plan</p>
          </div>

          <div className="p-4 rounded-xl bg-obsidian border border-steel/60 space-y-2">
            <div className="flex items-center justify-between text-ash">
              <span className="flex items-center gap-1.5"><HardDrive size={14} className="text-purple-400" /> Base de Datos PostgreSQL</span>
              <span className="font-semibold text-paper">Conectada</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-steel/40 overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full" style={{ width: '100%' }} />
            </div>
            <p className="text-[11px] text-ash">Row-Level Security (RLS) activo</p>
          </div>
        </div>
      </Card>

      {/* Subscription Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-steel/60">
          <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
            <CreditCard size={20} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-paper">Información de Facturación</h4>
            <p className="text-xs text-ash">Suscripción gestionada directamente en tu instancia de servidor</p>
          </div>
        </div>
        <p className="text-xs text-ash">
          Tu instancia está configurada con acceso completo a todos los 21 Bounded Contexts, MCP Server y APIs públicas.
        </p>
      </Card>
    </div>
  )
}
