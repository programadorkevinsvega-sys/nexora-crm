'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { Building2, Globe, Save, Check, ShieldCheck } from 'lucide-react'

export function OrganizationSettingsTab() {
  const { session, setSession } = useSession()
  const [name, setName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [timeZone, setTimeZone] = useState('America/Bogota')
  const [domain, setDomain] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (session) {
      const savedOrg = localStorage.getItem(`crm_org_${session.tenantId}`)
      if (savedOrg) {
        try {
          const parsed = JSON.parse(savedOrg)
          setName(parsed.name || session.companyName || 'Mi Empresa')
          setLegalName(parsed.legalName || `${session.companyName || 'Mi Empresa'} S.A.S.`)
          setTaxId(parsed.taxId || '')
          setCurrency(parsed.currency || 'USD')
          setTimeZone(parsed.timeZone || 'America/Bogota')
          setDomain(parsed.domain || window.location.host)
          return
        } catch (_) {}
      }

      setName(session.companyName || 'Mi Empresa')
      setLegalName(session.companyName ? `${session.companyName} S.A.S.` : '')
      setDomain(typeof window !== 'undefined' ? window.location.host : '')
    }
  }, [session])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (session) {
      const payload = { name, legalName, taxId, currency, timeZone, domain }
      localStorage.setItem(`crm_org_${session.tenantId}`, JSON.stringify(payload))
      setSession({ ...session, companyName: name })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-steel/60">
          <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-paper">Configuración de la Organización</h3>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck size={14} /> Organización Activa & Aislada por RLS
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-ash mb-1 block">Nombre Comercial</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Mi Empresa" required />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Razón Social</label>
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Ej. Mi Empresa S.A.S." />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Identificación Fiscal / NIT / CIF</label>
            <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="Ej. 900.000.000-1" />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Dominio / Host Asignado</label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Moneda Principal</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-obsidian border border-steel rounded-lg px-3 py-2 text-xs text-paper w-full focus:outline-none focus:border-signal-blue"
            >
              <option value="USD">USD ($) — Dólar Estadounidense</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="COP">COP ($) — Peso Colombiano</option>
              <option value="MXN">MXN ($) — Peso Mexicano</option>
              <option value="ARS">ARS ($) — Peso Argentino</option>
              <option value="CLP">CLP ($) — Peso Chileno</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Zona Horaria</label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="bg-obsidian border border-steel rounded-lg px-3 py-2 text-xs text-paper w-full focus:outline-none focus:border-signal-blue"
            >
              <option value="America/Bogota">America/Bogota (UTC-5)</option>
              <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="America/Santiago">America/Santiago (UTC-3)</option>
              <option value="Europe/Madrid">Europe/Madrid (UTC+1)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-steel/60">
          <span className="text-xs text-ash flex items-center gap-1.5">
            <Globe size={14} className="text-signal-blue" /> Parámetros regionales sincronizados con tu organización.
          </span>
          <Button type="submit" className="gap-2">
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Guardado exitosamente' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
