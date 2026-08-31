"use client"

import React, { useState, useEffect } from "react"
import { ApiIntegrationsRepository } from "@/src/infrastructure/crm/repositories/integrations/api-integrations.repository"
import { ApiMetaLeadsRepository } from "@/src/infrastructure/crm/repositories/meta-leads/api-meta-leads.repository"
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
import { TiktokConfigModal } from "./modals/tiktok-config-modal"
import { StorageConfigModal } from "./modals/storage-config-modal"
import {
  MessageSquare, Mail, Smartphone, Send, CreditCard,
  RefreshCw, Sparkles, Calendar, ShoppingBag, Database, Zap, Cloud, Megaphone, FileText, Camera, HardDrive,
} from "lucide-react"

export function IntegrationsSettingsTab() {
  const [statuses, setStatuses] = useState<IntegrationStatus[]>([])
  const [isMetaConnected, setIsMetaConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<IntegrationProvider | null>(null)

  const loadStatuses = async () => {
    setLoading(true)
    try {
      const [data, metaStatus] = await Promise.allSettled([
        ApiIntegrationsRepository.listStatuses(),
        ApiMetaLeadsRepository.getStatus(),
      ])
      if (data.status === "fulfilled") setStatuses(data.value)
      if (metaStatus.status === "fulfilled") {
        setIsMetaConnected(metaStatus.value?.status === "CONNECTED")
      }
    } catch (_) {
      setStatuses([])
      setIsMetaConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatuses()
  }, [])

  const getStatus = (p: IntegrationProvider) => statuses.find((s) => s.provider === p)
  const isConfigured = (p: IntegrationProvider) => {
    if (p === "META_FACEBOOK_LEADS" || p === "INSTAGRAM_LEADS") return isMetaConnected
    return getStatus(p)?.isConfigured ?? false
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100">Hub Central de Integraciones & Conectores</h3>
          <p className="text-xs text-zinc-400">
            Conecta canales de mensajería, publicidad en redes, pasarelas de pago y automatizaciones
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

      {/* Sección 1: Mensajería & Omnicanalidad */}
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
            title="Twilio SMS & VoIP"
            subtitle="Telefonía & SMS"
            description="Llamadas directas desde el navegador (Click-to-Call) y envío masivo de SMS transaccionales."
            icon={<Smartphone size={20} />}
            iconColorClass="text-sky-400 bg-sky-500/10 border-sky-500/20"
            isConfigured={isConfigured("TWILIO_SMS")}
            onConfigure={() => setActiveModal("TWILIO_SMS")}
            configureLabel={isConfigured("TWILIO_SMS") ? "Editar Twilio" : "Conectar Twilio"}
          />
        </div>
      </div>

      {/* Sección 2: Publicidad & Redes Sociales */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          2. Redes Sociales & Captura de Prospectos (Inbound Leads)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <IntegrationCard
            title="Facebook Lead Ads"
            subtitle="Meta Business Suite"
            description="Captura de leads instantánea desde campañas de Facebook con creación de Deals."
            icon={<Megaphone size={20} />}
            iconColorClass="text-blue-400 bg-blue-600/10 border-blue-500/20"
            isConfigured={isConfigured("META_FACEBOOK_LEADS")}
            externalLink="/integrations/facebook"
            configureLabel="Panel Facebook Ads"
          />
          <IntegrationCard
            title="Instagram Lead Ads"
            subtitle="Instagram for Business"
            description="Sincronización de prospectos capturados en anuncios de historias, reels y feed de Instagram."
            icon={<Camera size={20} />}
            iconColorClass="text-pink-400 bg-pink-500/10 border-pink-500/20"
            isConfigured={isConfigured("INSTAGRAM_LEADS")}
            externalLink="/integrations/facebook"
            configureLabel="Configurar con Meta"
          />
          <IntegrationCard
            title="TikTok Lead Ads"
            subtitle="TikTok Ads Manager"
            description="Recepción en vivo de prospectos generados desde formularios Instant Form de TikTok."
            icon={<Smartphone size={20} />}
            iconColorClass="text-rose-400 bg-rose-500/10 border-rose-500/20"
            isConfigured={isConfigured("TIKTOK_LEADS")}
            onConfigure={() => setActiveModal("TIKTOK_LEADS")}
            configureLabel="Webhook TikTok"
          />
          <IntegrationCard
            title="Formularios Web"
            subtitle="Constructor Embebible"
            description="Formularios para incrustar en WordPress, Shopify o Landing pages mediante iframe."
            icon={<FileText size={20} />}
            iconColorClass="text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
            isConfigured={true}
            externalLink="/forms"
            configureLabel="Ir a Formularios"
          />
        </div>
      </div>

      {/* Sección 3: Email Transaccional */}
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
            configureLabel={isConfigured("SMTP_EMAIL") ? "Editar SMTP" : "Conectar Servidor"}
          />
          <IntegrationCard
            title="Amazon AWS SES"
            subtitle="Cloud Email Service"
            description="Infraestructura cloud de alta entregabilidad para email masivo y campañas."
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
            description="Procesamiento de pagos con tarjeta, cobro de cotizaciones y suscripciones."
            icon={<CreditCard size={20} />}
            iconColorClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
            isConfigured={isConfigured("STRIPE")}
            onConfigure={() => setActiveModal("STRIPE")}
            configureLabel={isConfigured("STRIPE") ? "Editar Stripe" : "Conectar Stripe"}
          />
          <IntegrationCard
            title="Shopify E-Commerce"
            subtitle="Tienda Online"
            description="Sincronización de clientes, carritos abandonados y pedidos completados."
            icon={<ShoppingBag size={20} />}
            iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            isConfigured={isConfigured("SHOPIFY_STORE")}
            onConfigure={() => setActiveModal("SHOPIFY_STORE")}
            configureLabel={isConfigured("SHOPIFY_STORE") ? "Editar Tienda" : "Conectar Shopify"}
          />
        </div>
      </div>

      {/* Sección 5: Productividad & Automatización */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          5. Productividad, Automatización & AI
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <IntegrationCard
            title="Google Workspace & Meet"
            subtitle="Calendario & Citas"
            description="Sincronización de Google Calendar y generación de salas Google Meet."
            icon={<Calendar size={20} />}
            iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
            isConfigured={isConfigured("GOOGLE_WORKSPACE")}
            onConfigure={() => setActiveModal("GOOGLE_WORKSPACE")}
            configureLabel={isConfigured("GOOGLE_WORKSPACE") ? "Editar Google" : "Conectar Google"}
          />
          <IntegrationCard
            title="Slack Workspace"
            subtitle="Alertas en Canales"
            description="Notificaciones en vivo en canales de equipo (#ventas) al cerrar Deals."
            icon={<MessageSquare size={20} />}
            iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            isConfigured={isConfigured("SLACK_APP")}
            onConfigure={() => setActiveModal("SLACK_APP")}
            configureLabel={isConfigured("SLACK_APP") ? "Editar Slack" : "Conectar Slack"}
          />
          <IntegrationCard
            title="Zapier & Make.com"
            subtitle="Webhooks Universales"
            description="Conexión de eventos comerciales hacia más de 5,000 aplicaciones externas."
            icon={<Zap size={20} />}
            iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
            isConfigured={isConfigured("ZAPIER_MAKE")}
            onConfigure={() => setActiveModal("ZAPIER_MAKE")}
            configureLabel={isConfigured("ZAPIER_MAKE") ? "Editar Webhook" : "Configurar Webhooks"}
          />
        </div>
      </div>

      {/* Sección 6: Almacenamiento en la Nube */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          6. Almacenamiento en la Nube (Base de Conocimiento, PDFs, Imágenes)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <IntegrationCard
            title="Cloudflare R2"
            subtitle="Object Storage S3-Compatible"
            description="Almacena archivos de la Base de Conocimiento (PDFs, DOCX, imágenes) con ancho de banda gratuito y CDN global."
            icon={<HardDrive size={20} />}
            iconColorClass="text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
            isConfigured={isConfigured("CLOUDFLARE_R2")}
            onConfigure={() => setActiveModal("CLOUDFLARE_R2")}
            configureLabel={isConfigured("CLOUDFLARE_R2") ? "Editar R2" : "Conectar Cloudflare R2"}
          />
          <IntegrationCard
            title="Amazon S3"
            subtitle="AWS Object Storage"
            description="Almacenamiento empresarial en S3 con control granular de acceso, versionado y replicación entre regiones."
            icon={<Cloud size={20} />}
            iconColorClass="text-orange-400 bg-orange-500/10 border-orange-500/20"
            isConfigured={isConfigured("AWS_S3")}
            onConfigure={() => setActiveModal("AWS_S3")}
            configureLabel={isConfigured("AWS_S3") ? "Editar Amazon S3" : "Conectar Amazon S3"}
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
      <TiktokConfigModal open={activeModal === "TIKTOK_LEADS"} onClose={() => setActiveModal(null)} onSuccess={loadStatuses} />
      <StorageConfigModal
        open={activeModal === "CLOUDFLARE_R2" || activeModal === "AWS_S3"}
        onClose={() => setActiveModal(null)}
        onSuccess={loadStatuses}
      />
    </div>
  )
}
