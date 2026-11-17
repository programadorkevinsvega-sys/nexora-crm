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

export function TwilioConfigModal({ open, onClose, onSuccess }: Props) {
  const [accountSid, setAccountSid] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [fromNumber, setFromNumber] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ApiIntegrationsRepository.saveConfig('TWILIO_SMS', {
        accountSid,
        authToken,
        fromNumber,
      })
      onSuccess()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    if (!testPhone) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await ApiIntegrationsRepository.testIntegration('TWILIO_SMS', testPhone)
      setTestResult(res)
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error probando Twilio' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Conectar Twilio SMS">
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <p className="text-ash">
          Envía mensajes SMS transaccionales y de marketing a tus contactos directamente desde las campañas y automatizaciones del CRM.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-ash mb-1 block font-medium">Twilio Account SID</label>
            <Input value={accountSid} onChange={(e) => setAccountSid(e.target.value)} placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" required />
          </div>

          <div>
            <label className="text-ash mb-1 block font-medium">Twilio Auth Token</label>
            <Input type="password" value={authToken} onChange={(e) => setAuthToken(e.target.value)} placeholder="••••••••••••••••••••••••••••••••" required />
          </div>

          <div>
            <label className="text-ash mb-1 block font-medium">Número Remitente Twilio (+1...)</label>
            <Input value={fromNumber} onChange={(e) => setFromNumber(e.target.value)} placeholder="+12015550123" required />
          </div>
        </div>

        {/* Test Section */}
        <div className="p-3 rounded-lg bg-steel/20 border border-steel/50 space-y-2">
          <label className="text-paper font-semibold block">Probar Envío de SMS:</label>
          <div className="flex gap-2">
            <Input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+57 300 000 0000"
              className="text-xs"
            />
            <Button type="button" variant="secondary" onClick={handleTest} disabled={testing || !testPhone} className="shrink-0 text-xs gap-1">
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
