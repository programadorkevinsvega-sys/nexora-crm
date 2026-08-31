'use client'

import { useState } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { ApiIntegrationsRepository } from '@/src/infrastructure/crm/repositories/integrations/api-integrations.repository'
import { Sparkles, Bot, X, CheckCircle2, AlertTriangle, Send, Server, Cpu, Zap } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type ProviderPreset = 'OPENAI' | 'OLLAMA_LOCAL' | 'GROQ' | 'DEEPSEEK' | 'CUSTOM'

export function AiConfigModal({ open, onClose, onSuccess }: Props) {
  const [preset, setPreset] = useState<ProviderPreset>('OPENAI')
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [temperature, setTemperature] = useState('0.7')
  const [testPrompt, setTestPrompt] = useState('Di "Conexión exitosa a Nexus CRM" en menos de 10 palabras')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!open) return null

  const handleSelectPreset = (p: ProviderPreset) => {
    setPreset(p)
    setTestResult(null)
    if (p === 'OPENAI') {
      setBaseUrl('https://api.openai.com/v1')
      setModel('gpt-4o-mini')
    } else if (p === 'OLLAMA_LOCAL') {
      setBaseUrl('http://localhost:11434/v1')
      setModel('llama3:8b')
    } else if (p === 'GROQ') {
      setBaseUrl('https://api.groq.com/openai/v1')
      setModel('llama-3.3-70b-versatile')
    } else if (p === 'DEEPSEEK') {
      setBaseUrl('https://api.deepseek.com/v1')
      setModel('deepseek-chat')
    } else {
      setBaseUrl('http://localhost:1234/v1')
      setModel('local-model')
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await ApiIntegrationsRepository.testIntegration({
        provider: 'OPENAI_LLM' as any,
        recipient: 'test',
        testMessage: testPrompt,
      })
      setTestResult(res)
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error al conectar con el modelo AI' })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ApiIntegrationsRepository.saveIntegration({
        provider: 'OPENAI_LLM' as any,
        credentials: {
          providerPreset: preset,
          baseUrl,
          apiKey: apiKey || undefined,
          model,
          temperature: parseFloat(temperature) || 0.7,
        },
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error al guardar la configuración' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <Card className="w-full max-w-xl bg-card border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Configurar Proveedor de Inteligencia Artificial & LLM</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Seleccionar Proveedor / Modelo:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'OPENAI', label: 'OpenAI Cloud', icon: Bot, desc: 'gpt-4o / mini' },
              { id: 'OLLAMA_LOCAL', label: 'Ollama (Local)', icon: Server, desc: 'localhost:11434' },
              { id: 'GROQ', label: 'Groq Cloud', icon: Zap, desc: 'Ultra-Rápido' },
              { id: 'DEEPSEEK', label: 'DeepSeek API', icon: Cpu, desc: 'deepseek-chat' },
              { id: 'CUSTOM', label: 'LocalAI / vLLM', icon: Server, desc: 'OpenAI-Compatible' },
            ].map((item) => {
              const Icon = item.icon
              const isSel = preset === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item.id as ProviderPreset)}
                  className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                    isSel
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/80 mt-1">{item.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-muted-foreground">URL Base del Endpoint (OpenAI-Compatible Base URL)</label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1 o http://localhost:11434/v1"
              required
            />
            <p className="text-[10px] text-muted-foreground font-mono">
              Para Ollama local usa: http://localhost:11434/v1 • Para LM Studio: http://localhost:1234/v1
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-muted-foreground">API Key / Token</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={preset === 'OLLAMA_LOCAL' ? 'Opcional en Ollama local' : 'sk-... o gsk_...'}
              />
              <span className="text-[10px] text-muted-foreground">Encriptado con SecretsVault (AES-256-GCM)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground">ID del Modelo (Model Name)</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini / llama3:8b / deepseek-chat"
                required
              />
            </div>
          </div>

          {/* Test Section */}
          <div className="p-3 bg-muted/20 border rounded-lg space-y-2">
            <label className="text-xs font-semibold text-foreground">Probar Conexión con el Modelo:</label>
            <div className="flex gap-2">
              <Input
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Prompt de prueba..."
                className="text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleTest} disabled={testing}>
                <Send className={`h-3 w-3 mr-1 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Probando...' : 'Probar'}
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded text-xs flex items-start gap-2 border ${
                  testResult.success
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                <div>{testResult.message}</div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar y Activar AI'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
