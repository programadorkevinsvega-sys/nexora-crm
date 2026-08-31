'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { ApiIntegrationsRepository } from '@/src/infrastructure/crm/repositories/integrations/api-integrations.repository'
import type { IntegrationStatus, IntegrationProvider } from '@crm/contracts'
import { WhatsAppConfigModal } from './modals/whatsapp-config-modal'
import { TwilioConfigModal } from './modals/twilio-config-modal'
import { TelegramConfigModal } from './modals/telegram-config-modal'
import { SmtpConfigModal } from './modals/smtp-config-modal'
import { AiConfigModal } from './modals/ai-config-modal'
import { MessageSquare, Mail, Smartphone, Send, Bot, Share2, CreditCard, CheckCircle2, Settings, ExternalLink, RefreshCw, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function IntegrationsSettingsTab() {
  const [statuses, setStatuses] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<IntegrationProvider | null>(null)

  const loadStatuses = async () => {
    setLoading(true)
    try {
      const data = await ApiIntegrationsRepository.listStatuses()
      setStatuses(data)
    } catch (_) {
      setStatuses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatuses()
  }, [])

  const getStatus = (p: IntegrationProvider) => statuses.find((s) => s.provider === p)

  const isConfigured = (p: IntegrationProvider) => getStatus(p)?.isConfigured ?? false

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-paper">Hub de Proveedores & Canales Reales</h3>
          <p className="text-xs text-ash">Configura tus credenciales reales para WhatsApp, SMS, Correo y Telegram</p>
        </div>
        <button
          onClick={loadStatuses}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-steel bg-graphite text-xs text-ash hover:text-paper hover:border-signal-blue transition-colors self-start"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar Estado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* WhatsApp */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-paper">WhatsApp Cloud API (Meta)</h4>
                <span className="text-[10px] text-ash uppercase font-semibold">Mensajería Oficial</span>
              </div>
            </div>
            {isConfigured('WHATSAPP_CLOUD') ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={11} /> Conectado
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-steel/40 text-ash border border-steel/60">
                Sin Configurar
              </span>
            )}
          </div>
          <p className="text-ash">Conexión con Meta for Developers para recibir y enviar chats en la bandeja unificada.</p>
          <div className="pt-2 border-t border-steel/60 flex justify-end">
            <Button onClick={() => setActiveModal('WHATSAPP_CLOUD')} className="text-xs gap-1.5 h-7">
              <Settings size={12} /> {isConfigured('WHATSAPP_CLOUD') ? 'Editar Credenciales' : 'Conectar WhatsApp'}
            </Button>
          </div>
        </Card>

        {/* SMTP / Gmail */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-purple-400 bg-purple-500/10 border-purple-500/20">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-paper">Gmail / SMTP / SendGrid</h4>
                <span className="text-[10px] text-ash uppercase font-semibold">Email Transaccional</span>
              </div>
            </div>
            {isConfigured('SMTP_EMAIL') ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={11} /> Conectado
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-steel/40 text-ash border border-steel/60">
                Sin Configurar
              </span>
            )}
          </div>
          <p className="text-ash">Envío de campañas, cotizaciones y respuestas automáticas de tickets por correo.</p>
          <div className="pt-2 border-t border-steel/60 flex justify-end">
            <Button onClick={() => setActiveModal('SMTP_EMAIL')} className="text-xs gap-1.5 h-7">
              <Settings size={12} /> {isConfigured('SMTP_EMAIL') ? 'Editar Servidor' : 'Conectar Correo'}
            </Button>
          </div>
        </Card>

        {/* Twilio SMS */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-sky-400 bg-sky-500/10 border-sky-500/20">
                <Smartphone size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-paper">Twilio SMS</h4>
                <span className="text-[10px] text-ash uppercase font-semibold">Mensajería Móvil</span>
              </div>
            </div>
            {isConfigured('TWILIO_SMS') ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={11} /> Conectado
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-steel/40 text-ash border border-steel/60">
                Sin Configurar
              </span>
            )}
          </div>
          <p className="text-ash">Envío masivo de alertas, códigos OTP y recordatorios de citas vía SMS con Twilio.</p>
          <div className="pt-2 border-t border-steel/60 flex justify-end">
            <Button onClick={() => setActiveModal('TWILIO_SMS')} className="text-xs gap-1.5 h-7">
              <Settings size={12} /> {isConfigured('TWILIO_SMS') ? 'Editar Twilio' : 'Conectar Twilio'}
            </Button>
          </div>
        </Card>

        {/* Telegram Bot */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-blue-400 bg-blue-500/10 border-blue-500/20">
                <Send size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-paper">Telegram Bot (@BotFather)</h4>
                <span className="text-[10px] text-ash uppercase font-semibold">Canal de Soporte</span>
              </div>
            </div>
            {isConfigured('TELEGRAM_BOT') ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={11} /> Conectado
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-steel/40 text-ash border border-steel/60">
                Sin Configurar
              </span>
            )}
          </div>
          <p className="text-ash">Atención de soporte técnico y alertas comerciales en grupos o chats privados de Telegram.</p>
          <div className="pt-2 border-t border-steel/60 flex justify-end">
            <Button onClick={() => setActiveModal('TELEGRAM_BOT')} className="text-xs gap-1.5 h-7">
              <Settings size={12} /> {isConfigured('TELEGRAM_BOT') ? 'Editar Bot' : 'Conectar Telegram'}
            </Button>
          </div>
        </Card>

        {/* OpenAI / Local LLM */}
        <Card className="p-5 flex flex-col justify-between space-y-4 md:col-span-2 bg-gradient-to-r from-signal-blue/5 to-purple-500/5 border-signal-blue/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-purple-400 bg-purple-500/10 border-purple-500/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-paper">Inteligencia Artificial & Modelos LLM (OpenAI / Ollama Local)</h4>
                <span className="text-[10px] text-ash uppercase font-semibold">Motor Copilot & Generación</span>
              </div>
            </div>
            {isConfigured('OPENAI_LLM' as any) ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={11} /> Conectado
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-steel/40 text-ash border border-steel/60">
                Sin Configurar
              </span>
            )}
          </div>
          <p className="text-ash">
            Conecta modelos en la nube (OpenAI GPT-4o, DeepSeek, Groq) o <strong>modelos locales en tu propia máquina o servidor</strong> (Ollama, LocalAI, LM Studio, vLLM) para redactar correos, predecir probabilidades de cierre de Deals y resumir clientes.
          </p>
          <div className="pt-2 border-t border-steel/60 flex justify-end">
            <Button onClick={() => setActiveModal('OPENAI_LLM' as any)} className="text-xs gap-1.5 h-7">
              <Settings size={12} /> {isConfigured('OPENAI_LLM' as any) ? 'Editar Modelo AI' : 'Configurar Modelo AI'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <WhatsAppConfigModal open={activeModal === 'WHATSAPP_CLOUD'} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <TwilioConfigModal open={activeModal === 'TWILIO_SMS'} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <TelegramConfigModal open={activeModal === 'TELEGRAM_BOT'} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <SmtpConfigModal open={activeModal === 'SMTP_EMAIL'} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <AiConfigModal open={activeModal === ('OPENAI_LLM' as any)} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
    </div>
  )
}

