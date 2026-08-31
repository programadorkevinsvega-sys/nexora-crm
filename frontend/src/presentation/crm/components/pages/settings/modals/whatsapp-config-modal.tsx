'use client'

import { useState } from 'react'
import { Modal } from '@/src/presentation/crm/components/ui/Modal'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { ApiIntegrationsRepository } from '@/src/infrastructure/crm/repositories/integrations/api-integrations.repository'
import { MessageSquare, Send, Check, Copy, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function WhatsAppConfigModal({ open, onClose, onSuccess }: Props) {
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [wabaId, setWabaId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api/webhooks/whatsapp` : 'https://api.tudominio.com/api/webhooks/whatsapp'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ApiIntegrationsRepository.saveConfig('WHATSAPP_CLOUD', {
        phoneNumberId,
        wabaId,
        accessToken,
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
      const res = await ApiIntegrationsRepository.testIntegration('WHATSAPP_CLOUD', testPhone)
      setTestResult(res)
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error probando WhatsApp' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Conectar WhatsApp Cloud API (Meta Oficial)">
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <p className="text-ash">
          Conecta directamente tu cuenta de <strong>Meta for Developers</strong> para enviar y recibir mensajes de WhatsApp en la bandeja unificada.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-ash mb-1 block font-medium">Phone Number ID</label>
            <Input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="Ej. 109283746592019" required />
          </div>

          <div>
            <label className="text-ash mb-1 block font-medium">WhatsApp Business Account ID (WABA)</label>
            <Input value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="Ej. 293847561029384" required />
          </div>

          <div>
            <label className="text-ash mb-1 block font-medium">Token de Acceso Permanente (System User Token)</label>
            <Input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="EAAB..." required />
          </div>
        </div>

        {/* Webhook instructions */}
        <div className="p-3 rounded-lg bg-obsidian border border-steel/60 space-y-1.5">
          <div className="flex items-center justify-between text-paper font-semibold text-[11px]">
            <span>URL de Webhook para Meta Developers:</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="text-signal-blue flex items-center gap-1 hover:underline"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'Copiada' : 'Copiar URL'}
            </button>
          </div>
          <code className="block p-1.5 rounded bg-steel/20 text-ash text-[10px] break-all">{webhookUrl}</code>
        </div>

        {/* Test Section */}
        <div className="p-3 rounded-lg bg-steel/20 border border-steel/50 space-y-2">
          <label className="text-paper font-semibold block">Probar Envío de WhatsApp en Vivo:</label>
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
