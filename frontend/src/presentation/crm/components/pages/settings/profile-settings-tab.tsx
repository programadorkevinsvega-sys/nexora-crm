'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { Avatar } from '@/src/presentation/crm/components/ui/Avatar'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { Mail, Save, Check, Sparkles, ShieldCheck } from 'lucide-react'

export function ProfileSettingsTab() {
  const { session, setSession } = useSession()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [signature, setSignature] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (session) {
      const savedProfile = localStorage.getItem(`crm_profile_${session.userId}`)
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setFullName(parsed.fullName || session.userName || '')
          setEmail(parsed.email || session.userEmail || '')
          setJobTitle(parsed.jobTitle || 'Administrador')
          setPhone(parsed.phone || '')
          setSignature(parsed.signature || `--\n**${session.userName || 'Usuario'}**\n${session.companyName || 'Nexus CRM'}`)
          return
        } catch (_) {}
      }

      setFullName(session.userName || '')
      setEmail(session.userEmail || '')
      setJobTitle('Administrador')
      setSignature(`--\n**${session.userName || 'Usuario'}**\n${session.companyName || 'Nexus CRM'}`)
    }
  }, [session])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (session) {
      const payload = { fullName, email, jobTitle, phone, signature }
      localStorage.setItem(`crm_profile_${session.userId}`, JSON.stringify(payload))
      setSession({ ...session, userName: fullName, userEmail: email })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-steel/60">
          <Avatar name={fullName || session?.userName || 'User'} size="lg" />
          <div>
            <h3 className="text-base font-semibold text-paper">{fullName || 'Mi Perfil'}</h3>
            <p className="text-xs text-ash flex items-center gap-1.5">
              <span>{jobTitle}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck size={13} /> Cuenta Principal
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-ash mb-1 block">Nombre Completo</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Correo Electrónico</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Cargo / Posición</label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Ej. Director Comercial" />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Teléfono / WhatsApp</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+57 300 000 0000" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-ash flex items-center gap-1.5">
              <Mail size={14} className="text-signal-blue" /> Firma de Correo Electrónico
            </label>
            <span className="text-[11px] text-ash">Markdown soportado</span>
          </div>
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={4}
            className="w-full bg-obsidian border border-steel rounded-lg p-3 text-xs text-paper font-mono focus:outline-none focus:border-signal-blue"
          />
        </div>

        <div className="p-3.5 rounded-lg bg-obsidian/70 border border-steel/50">
          <span className="text-[11px] text-ash font-medium block mb-1">Vista Previa de la Firma:</span>
          <div className="text-xs text-paper whitespace-pre-line border-l-2 border-signal-blue pl-3 py-0.5">
            {signature}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-steel/60">
          <span className="text-xs text-ash flex items-center gap-1.5">
            <Sparkles size={14} className="text-signal-blue" /> Firma activa para tus comunicaciones comerciales y redacciones con IA.
          </span>
          <Button type="submit" className="gap-2">
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Guardado exitosamente' : 'Guardar Perfil'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
