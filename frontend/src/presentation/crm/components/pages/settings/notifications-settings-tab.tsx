'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { Bell, Save, Check } from 'lucide-react'

interface NotificationRule {
  id: string
  label: string
  desc: string
  inApp: boolean
  email: boolean
  whatsapp: boolean
}

const DEFAULT_RULES: NotificationRule[] = [
  { id: '1', label: 'Deal Ganado o Perdido', desc: 'Cuando una oportunidad cambia a WON o LOST', inApp: true, email: true, whatsapp: true },
  { id: '2', label: 'Nuevo Ticket de Soporte', desc: 'Cuando un cliente abre un ticket urgente o prioritario', inApp: true, email: true, whatsapp: false },
  { id: '3', label: 'Lead / Contacto Asignado', desc: 'Cuando un nuevo contacto comercial es asignado a tu usuario', inApp: true, email: true, whatsapp: true },
  { id: '4', label: 'Cotización Aceptada', desc: 'Cuando el cliente aprueba una cotización CPQ en línea', inApp: true, email: true, whatsapp: true },
  { id: '5', label: 'Menciones & Tareas Vencidas', desc: 'Cuando alguien te menciona en una nota o una tarea expira', inApp: true, email: false, whatsapp: false },
]

export function NotificationsSettingsTab() {
  const { session } = useSession()
  const [rules, setRules] = useState<NotificationRule[]>(DEFAULT_RULES)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (session) {
      const stored = localStorage.getItem(`crm_notif_${session.userId}`)
      if (stored) {
        try {
          setRules(JSON.parse(stored))
        } catch (_) {}
      }
    }
  }, [session])

  const toggleRule = (id: string, channel: 'inApp' | 'email' | 'whatsapp') => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [channel]: !r[channel] } : r)))
  }

  const handleSave = () => {
    if (session) {
      localStorage.setItem(`crm_notif_${session.userId}`, JSON.stringify(rules))
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-steel/60">
        <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
          <Bell size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-paper">Preferencias de Notificaciones & Alertas</h3>
          <p className="text-xs text-ash">Configuración personalizada para tu usuario</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-steel/60 text-left text-ash uppercase tracking-wider font-semibold">
              <th className="pb-3">Evento Comercial</th>
              <th className="pb-3 text-center">En la App</th>
              <th className="pb-3 text-center">Email</th>
              <th className="pb-3 text-center">WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel/40">
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-steel/20 transition-colors">
                <td className="py-3.5 pr-4">
                  <div className="font-semibold text-paper">{r.label}</div>
                  <div className="text-ash text-[11px]">{r.desc}</div>
                </td>
                <td className="py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={r.inApp}
                    onChange={() => toggleRule(r.id, 'inApp')}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={r.email}
                    onChange={() => toggleRule(r.id, 'email')}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={r.whatsapp}
                    onChange={() => toggleRule(r.id, 'whatsapp')}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4 border-t border-steel/60">
        <Button onClick={handleSave} className="gap-2">
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Preferencias Guardadas' : 'Guardar Preferencias'}
        </Button>
      </div>
    </Card>
  )
}
