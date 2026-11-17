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

export function TelegramConfigModal({ open, onClose, onSuccess }: Props) {
  const [botToken, setBotToken] = useState('')
  const [testChatId, setTestChatId] = useState('')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ApiIntegrationsRepository.saveConfig('TELEGRAM_BOT', { botToken })
      onSuccess()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await ApiIntegrationsRepository.testIntegration('TELEGRAM_BOT', testChatId || 'test')
      setTestResult(res)
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error validando Bot de Telegram' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Conectar Telegram Bot">
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <p className="text-ash">
          Conecta un Bot de Telegram creado con <strong>@BotFather</strong> para atender clientes y recibir alertas automáticas.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-ash mb-1 block font-medium">Telegram Bot Token</label>
            <Input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              required
            />
            <span className="text-[11px] text-ash mt-1 block">
              Obtén tu token hablando con <code className="text-signal-blue">@BotFather</code> en Telegram.
            </span>
          </div>
        </div>

        {/* Test Section */}
        <div className="p-3 rounded-lg bg-steel/20 border border-steel/50 space-y-2">
          <label className="text-paper font-semibold block">Verificar Conexión del Bot:</label>
          <div className="flex gap-2">
            <Input
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              placeholder="Chat ID (opcional para mensaje)"
              className="text-xs"
            />
            <Button type="button" variant="secondary" onClick={handleTest} disabled={testing || !botToken} className="shrink-0 text-xs gap-1">
              <Send size={12} /> {testing ? 'Verificando…' : 'Probar'}
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
          <Button type="submit" disabled={loading}>{loading ? 'Guardando…' : 'Guardar Bot'}</Button>
        </div>
      </form>
    </Modal>
  )
}
