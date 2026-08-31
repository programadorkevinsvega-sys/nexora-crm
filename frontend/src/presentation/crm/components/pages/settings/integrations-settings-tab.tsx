"use client"

import React, { useState, useEffect } from "react"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"
import type { IntegrationStatus, IntegrationProvider } from "@crm/contracts"
import { IntegrationCard } from "./integration-card"
import { WhatsAppConfigModal } from "./modals/whatsapp-config-modal"
import { TwilioConfigModal } from "./modals/twilio-config-modal"
import { TelegramConfigModal } from "./modals/telegram-config-modal"
import { SmtpConfigModal } from "./modals/smtp-config-modal"
import { AiConfigModal } from "./modals/ai-config-modal"
import { StripeConfigModal } from "./modals/stripe-config-modal"
import { GoogleConfigModal } from "./modals/google-config-modal"
import { SlackConfigModal } from "./modals/slack-config-modal"
import { ShopifyConfigModal } from "./modals/shopify-config-modal"
import { HubSpotConfigModal } from "./modals/hubspot-config-modal"
import { ZapierConfigModal } from "./modals/zapier-config-modal"
import { AwsSesConfigModal } from "./modals/aws-ses-config-modal"
import {
  MessageSquare, Mail, Smartphone, Send, Bot, CreditCard,
  RefreshCw, Sparkles, Calendar, ShoppingBag, Database, Zap, Cloud, Globe, Megaphone, FileText
} from "lucide-react"

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100">Hub Central de Integraciones & Conectores</h3>
          <p className="text-xs text-zinc-400">
            Conecta canales de mensajería, pasarelas de pago, email empresarial, CRM sync y herramientas de productividad
          </p>
        </div>
        <button
          onClick={loadStatuses}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-zinc-100 hover:border-cyan-500 transition-colors self-start shadow-sm"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualizar Estado
        </button>
      </div>

      {/* Sección 1: Mensajería & Comunicación Directa */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          1. Canales de Mensajería & Omnicanalidad
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <IntegrationCard
            title="WhatsApp Cloud API"
            subtitle="Mensajería Oficial"
            description="Conexión con Meta for Developers para recibir y enviar chats en la bandeja unificada."
            icon={<MessageSquare size={20} />}
            iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            isConfigured={isConfigured("WHATSAPP_CLOUD")}
            onConfigure={() => setActiveModal("WHATSAPP_CLOUD")}
            configureLabel={isConfigured("WHATSAPP_CLOUD") ? "Editar Credenciales" : "Conectar WhatsApp"}
          />
          <IntegrationCard
            title="Telegram Bot"
            subtitle="Canal de Soporte"
            description="Atención de soporte técnico y alertas comerciales en grupos o chats privados de Telegram."
            icon={<Send size={20} />}
            iconColorClass="text-blue-400 bg-blue-500/10 border-blue-500/20"
            isConfigured={isConfigured("TELEGRAM_BOT")}
            onConfigure={() => setActiveModal("TELEGRAM_BOT")}
            configureLabel={isConfigured("TELEGRAM_BOT") ? "Editar Bot" : "Conectar Telegram"}
          />
          <IntegrationCard
            title="Twilio SMS"
            subtitle="Mensajería Móvil"
            description="Envío masivo de alertas, códigos OTP y recordatorios de citas vía SMS con Twilio."
            icon={<Smartphone size={20} />}
            iconColorClass="text-sky-400 bg-sky-500/10 border-sky-500/20"
            isConfigured={isConfigured("TWILIO_SMS")}
            onConfigure={() => setActiveModal("TWILIO_SMS")}
            configureLabel={isConfigured("TWILIO_SMS") ? "Editar Twilio" : "Conectar Twilio"}
          />
        </div>
      </div>

      {/* Sección 2: Publicidad & Captura de Leads */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          2. Publicidad & Captura de Prospectos (Inbound Leads)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <IntegrationCard
            title="Meta Facebook Lead Ads"
            subtitle="Conector Nativo Meta"
            description="Captura de leads instantánea desde Facebook e Instagram Ads con sincronización de formularios y creación de Deals."
            icon={<Megaphone size={20} />}
            iconColorClass="text-blue-400 bg-blue-600/10 border-blue-500/20"
            isConfigured={true}
            externalLink="/integrations/facebook"
            configureLabel="Abrir Panel Facebook Ads"
          />
          <IntegrationCard
            title="Formularios Web Embebibles"
            subtitle="Form Builder"
            description="Constructor visual de formularios para embeber en WordPress, Shopify o Landing pages con iframe/script."
            icon={<FileText size={20} />}
            iconColorClass="text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
            isConfigured={true}
            externalLink="/forms"
            configureLabel="Ir al Creador de Formularios"
          />
        </div>
      </div>

      {/* Sección 3: Email Transaccional & Marketing */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          3. Email Transaccional & Servidores SMTP
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <IntegrationCard
            title="Gmail / SMTP / SendGrid"
            subtitle="Email Transaccional"
            description="Envío de campañas, cotizaciones y respuestas automáticas de tickets por correo."
            icon={<Mail size={20} />}
            iconColorClass="text-purple-400 bg-purple-500/10 border-purple-500/20"
            isConfigured={isConfigured("SMTP_EMAIL")}
            onConfigure={() => setActiveModal("SMTP_EMAIL")}
            configureLabel={isConfigured("SMTP_EMAIL") ? "Editar Servidor" : "Conectar Correo"}
          />
          <IntegrationCard
            title="Amazon AWS SES"
            subtitle="Cloud Email Service"
            description="Infraestructura cloud de alta entregabilidad para email masivo, campañas de marketing y cotizaciones."
            icon={<Cloud size={20} />}
            iconColorClass="text-orange-400 bg-orange-500/10 border-orange-500/20"
            isConfigured={isConfigured("AWS_SES")}
            onConfigure={() => setActiveModal("AWS_SES")}
            configureLabel={isConfigured("AWS_SES") ? "Editar AWS SES" : "Conectar Amazon SES"}
          />
        </div>
      </div>

      {/* Sección 4: Pagos & Pasarelas */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          4. Pagos, Facturación & Cobros
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <IntegrationCard
            title="Stripe Payments & Billing"
            subtitle="Pasarela de Cobro"
            description="Procesamiento de pagos con tarjeta de crédito, cobro de cotizaciones, enlaces de pago y suscripciones recurrentes."
            icon={<CreditCard size={20} />}
            iconColorClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
            isConfigured={isConfigured("STRIPE")}
            onConfigure={() => setActiveModal("STRIPE")}
            configureLabel={isConfigured("STRIPE") ? "Editar Stripe" : "Conectar Stripe"}
          />
          <IntegrationCard
            title="Shopify E-Commerce"
            subtitle="Tienda Online"
            description="Sincronización de clientes, carritos abandonados y pedidos completados convertidos en Oportunidades Ganadas."
            icon={<ShoppingBag size={20} />}
            iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            isConfigured={isConfigured("SHOPIFY_STORE")}
            onConfigure={() => setActiveModal("SHOPIFY_STORE")}
            configureLabel={isConfigured("SHOPIFY_STORE") ? "Editar Tienda" : "Conectar Shopify"}
          />
        </div>
      </div>

      {/* Sección 5: Productividad & Colaboración */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          5. Productividad, Calendario & Colaboración
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <IntegrationCard
            title="Google Workspace & Meet"
            subtitle="Calendario & Citas"
            description="Sincronización bidireccional de reuniones de Google Calendar y generación de salas Google Meet."
            icon={<Calendar size={20} />}
            iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
            isConfigured={isConfigured("GOOGLE_WORKSPACE")}
            onConfigure={() => setActiveModal("GOOGLE_WORKSPACE")}
            configureLabel={isConfigured("GOOGLE_WORKSPACE") ? "Editar Google" : "Conectar Google"}
          />
          <IntegrationCard
            title="Slack Workspace"
            subtitle="Alertas en Canales"
            description="Alertas automáticas en canales de equipo (#ventas) al cerrar Deals y registrar nuevos leads."
            icon={<MessageSquare size={20} />}
            iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            isConfigured={isConfigured("SLACK_APP")}
            onConfigure={() => setActiveModal("SLACK_APP")}
            configureLabel={isConfigured("SLACK_APP") ? "Editar Slack" : "Conectar Slack"}
          />
          <IntegrationCard
            title="HubSpot CRM Sync"
            subtitle="Migración & Enlace"
            description="Importación y sincronización de Empresas, Contactos y Oportunidades comerciales desde HubSpot."
            icon={<Database size={20} />}
            iconColorClass="text-orange-400 bg-orange-500/10 border-orange-500/20"
            isConfigured={isConfigured("HUBSPOT_SYNC")}
            onConfigure={() => setActiveModal("HUBSPOT_SYNC")}
            configureLabel={isConfigured("HUBSPOT_SYNC") ? "Editar HubSpot" : "Conectar HubSpot"}
          />
        </div>
      </div>

      {/* Sección 6: Automatización No-Code & AI */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          6. Ecosistema No-Code & Inteligencia Artificial
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <IntegrationCard
            title="Zapier, Make.com & n8n"
            subtitle="Webhooks Universales"
            description="Conecta Nexora CRM con más de 5,000 aplicaciones externas mediante disparadores de eventos en tiempo real."
            icon={<Zap size={20} />}
            iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
            isConfigured={isConfigured("ZAPIER_MAKE")}
            onConfigure={() => setActiveModal("ZAPIER_MAKE")}
            configureLabel={isConfigured("ZAPIER_MAKE") ? "Editar Webhook" : "Configurar Webhooks"}
          />
          <IntegrationCard
            title="Modelos LLM (OpenAI / Ollama Local)"
            subtitle="Motor Copilot & Generación"
            description="Conecta OpenAI GPT-4o, DeepSeek, Groq o modelos locales en tu máquina (Ollama) para redacción y predicción de Deals."
            icon={<Sparkles size={20} />}
            iconColorClass="text-purple-400 bg-purple-500/10 border-purple-500/20"
            isConfigured={isConfigured("OPENAI_LLM")}
            onConfigure={() => setActiveModal("OPENAI_LLM")}
            configureLabel={isConfigured("OPENAI_LLM") ? "Editar Modelo AI" : "Configurar Modelo AI"}
          />
        </div>
      </div>

      {/* Modals */}
      <WhatsAppConfigModal open={activeModal === "WHATSAPP_CLOUD"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <TwilioConfigModal open={activeModal === "TWILIO_SMS"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <TelegramConfigModal open={activeModal === "TELEGRAM_BOT"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <SmtpConfigModal open={activeModal === "SMTP_EMAIL"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <AwsSesConfigModal open={activeModal === "AWS_SES"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <StripeConfigModal open={activeModal === "STRIPE"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <GoogleConfigModal open={activeModal === "GOOGLE_WORKSPACE"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <SlackConfigModal open={activeModal === "SLACK_APP"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <ShopifyConfigModal open={activeModal === "SHOPIFY_STORE"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <HubSpotConfigModal open={activeModal === "HUBSPOT_SYNC"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <ZapierConfigModal open={activeModal === "ZAPIER_MAKE"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <AiConfigModal open={activeModal === "OPENAI_LLM"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
    </div>
  )
}
