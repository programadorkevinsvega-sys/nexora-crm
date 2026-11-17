'use client'

import { useState } from 'react'
import { Modal } from '@/src/presentation/crm/components/ui/Modal'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { ApiIntegrationsRepository } from '@/src/infrastructure/crm/repositories/integrations/api-integrations.repository'
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type EmailProviderType = 'RESEND' | 'GMAIL' | 'SENDGRID' | 'CUSTOM_SMTP'

export function SmtpConfigModal({ open, onClose, onSuccess }: Props) {
  const [providerType, setProviderType] = useState<EmailProviderType>('RESEND')
  const [host, setHost] = useState('smtp.resend.com')
  const [port, setPort] = useState(465)
  const [username, setUsername] = useState('resend')
  const [password, setPassword] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('Nexora CRM')
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleProviderChange = (type: EmailProviderType) => {
    setProviderType(type)
    if (type === 'RESEND') {
      setHost('smtp.resend.com')
      setPort(465)
      setUsername('resend')
      setPassword('')
    } else if (type === 'GMAIL') {
      setHost('smtp.gmail.com')
      setPort(587)
      setUsername('')
      setPassword('')
    } else if (type === 'SENDGRID') {
      setHost('smtp.sendgrid.net')
      setPort(587)
      setUsername('apikey')
      setPassword('')
    } else {
      setHost('')
      setPort(587)
      setUsername('')
      setPassword('')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ApiIntegrationsRepository.saveConfig('SMTP_EMAIL', {
        providerType,
        host,
        port: Number(port),
        username,
        password,
        fromEmail,
        fromName,
      })
      onSuccess()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    if (!testEmail) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await ApiIntegrationsRepository.testIntegration('SMTP_EMAIL', testEmail)
      setTestResult(res)
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error probando correo' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Conectar Proveedor de Correo Electrónico">
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="text-ash mb-1 block font-medium">Servicio de Correo</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'RESEND', label: 'Resend (API)' },
              { id: 'GMAIL', label: 'Gmail (App)' },
              { id: 'SENDGRID', label: 'SendGrid' },
              { id: 'CUSTOM_SMTP', label: 'SMTP Propio' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProviderChange(p.id as any)}
                className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors text-[11px] ${
                  providerType === p.id ? 'border-signal-blue bg-signal-blue/10 text-signal-blue' : 'border-steel bg-obsidian text-ash hover:text-paper'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-ash mb-1 block">
              {providerType === 'RESEND' ? 'Host de Resend' : 'SMTP Host'}
            </label>
            <Input value={host} onChange={(e) => setHost(e.target.value)} required />
          </div>
          <div>
            <label className="text-ash mb-1 block">Puerto SMTP</label>
            <Input type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} required />
          </div>
          <div>
            <label className="text-ash mb-1 block">
              {providerType === 'RESEND' ? 'Usuario (resend)' : 'Usuario / Email'}
            </label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="resend" required />
          </div>
          <div>
            <label className="text-ash mb-1 block">
              {providerType === 'RESEND' ? 'Resend API Key (re_...)' : 'Contraseña / API Key'}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={providerType === 'RESEND' ? 're_123456789...' : '••••••••••••'}
              required
            />
          </div>
          <div>
            <label className="text-ash mb-1 block">Correo Remitente (From Email)</label>
            <Input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="contacto@tuempresa.com" required />
          </div>
          <div>
            <label className="text-ash mb-1 block">Nombre Remitente (From Name)</label>
            <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Nexora CRM" required />
          </div>
        </div>

        {/* Test Section */}
        <div className="p-3 rounded-lg bg-steel/20 border border-steel/50 space-y-2">
          <label className="text-paper font-semibold block">Probar Envío de Correo:</label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="tu-correo@empresa.com"
              className="text-xs"
            />
            <Button type="button" variant="secondary" onClick={handleTest} disabled={testing || !testEmail} className="shrink-0 text-xs gap-1">
              <Send size={12} /> {testing ? 'Enviando…' : 'Probar'}
            </Button>
          </div>
          {testResult && (
            <div className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${
              testResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {testResult.success ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {testResult.message}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-steel/60">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Guardando…' : 'Guardar Credenciales'}</Button>
        </div>
      </form>
    </Modal>
  )
}
