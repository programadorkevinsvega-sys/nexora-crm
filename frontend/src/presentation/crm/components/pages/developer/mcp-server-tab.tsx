'use client'

import { useState } from 'react'
import { Bot, Copy, Check, ShieldCheck, Cpu, Terminal, Sparkles, Globe, Layers } from 'lucide-react'
import type { ApiKey } from '@/src/infrastructure/crm/repositories/developer/api-developer.repository'

interface Props {
  apiKeys: ApiKey[]
}

export function McpServerTab({ apiKeys }: Props) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string>(
    apiKeys.find((k) => k.isActive)?.id || ''
  )
  const [readOnlyMode, setReadOnlyMode] = useState(true)

  const activeKey = apiKeys.find((k) => k.id === selectedKey)
  const keyDisplay = activeKey ? `${activeKey.keyPrefix}…` : 'nex_live_tu_api_key_aqui'

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  // 1. Remote SSE Configuration (Cloud - Zero local installation)
  const remoteSseConfig = JSON.stringify(
    {
      mcpServers: {
        'nexora-crm-remote': {
          url: 'http://localhost:3006/api/mcp/sse',
          headers: {
            Authorization: `Bearer ${keyDisplay}`,
            'X-Api-Key': keyDisplay,
          },
        },
      },
    },
    null,
    2
  )

  // 2. Local NPX / Binary Configuration
  const localNpxConfig = JSON.stringify(
    {
      mcpServers: {
        'nexora-crm-local': {
          command: 'node',
          args: ['/home/servidor-nitro/ARCHIVOS-KEVINS/NUEVO/DESARROLLO/crm/crm-service/packages/mcp-server/dist/index.js'],
          env: {
            NEXORA_API_URL: 'http://localhost:3006',
            NEXORA_API_KEY: keyDisplay,
            ...(readOnlyMode ? { NEXORA_MCP_READONLY: 'true' } : {}),
          },
        },
      },
    },
    null,
    2
  )

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-steel bg-graphite p-4 space-y-1">
          <div className="flex items-center gap-2 text-signal-blue font-semibold text-sm">
            <Globe size={16} /> Doble Modo: Remoto & Local
          </div>
          <p className="text-xs text-ash">
            Conecta agentes vía <strong>URL SSE en la nube</strong> (sin instalar nada) o con el paquete <strong>NPX local</strong>.
          </p>
        </div>

        <div className="rounded-xl border border-steel bg-graphite p-4 space-y-1">
          <div className="flex items-center gap-2 text-signal-blue font-semibold text-sm">
            <ShieldCheck size={16} /> Seguridad Estricta
          </div>
          <p className="text-xs text-ash">
            Cero acceso directo a SQL. Aislamiento total vía API REST y guardarraíl <em>Solo Lectura</em>.
          </p>
        </div>

        <div className="rounded-xl border border-steel bg-graphite p-4 space-y-1">
          <div className="flex items-center gap-2 text-signal-blue font-semibold text-sm">
            <Sparkles size={16} /> 22 Herramientas de IA
          </div>
          <p className="text-xs text-ash">
            Customer 360, probabilidad de victoria en deals, predicción de churn y generador de borradores.
          </p>
        </div>
      </div>

      {/* Security & Key Selector */}
      <div className="rounded-xl border border-steel bg-graphite p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-paper flex items-center gap-2">
              <Cpu size={16} className="text-signal-blue" /> Selector de Clave de API para el Agente
            </h3>
            <p className="text-xs text-ash mt-0.5">
              Elige una clave para generar automáticamente los archivos de configuración JSON.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-ash hover:text-paper">
            <input
              type="checkbox"
              checked={readOnlyMode}
              onChange={(e) => setReadOnlyMode(e.target.checked)}
              className="accent-signal-blue"
            />
            <span className="font-medium text-emerald-400">Modo Solo Lectura Seguro (NEXORA_MCP_READONLY)</span>
          </label>
        </div>

        {apiKeys.length > 0 && (
          <div>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="bg-obsidian border border-steel rounded-lg px-3 py-2 text-xs text-paper w-full max-w-md focus:outline-none focus:border-signal-blue"
            >
              {apiKeys.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} ({k.keyPrefix}…) {k.isActive ? '— Activa' : '— Inactiva'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Config Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Remote SSE Mode */}
        <div className="rounded-xl border border-steel bg-graphite p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-paper flex items-center gap-2">
              <Globe size={14} className="text-signal-blue" /> 1. Conexión Remota SSE (Cero Instalación)
            </span>
            <button
              onClick={() => copyToClipboard(remoteSseConfig, 'remote')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-obsidian border border-steel text-xs text-ash hover:text-paper hover:border-signal-blue transition-colors"
            >
              {copiedSection === 'remote' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedSection === 'remote' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-[11px] text-ash">
            Pega esta configuración en clientes remotos. Se conecta al endpoint <code className="text-paper bg-obsidian px-1 py-0.5 rounded">/api/mcp/sse</code>.
          </p>
          <pre className="bg-obsidian border border-steel p-3 rounded-lg text-xs font-mono text-ash overflow-x-auto max-h-56">
            {remoteSseConfig}
          </pre>
        </div>

        {/* Local Stdio Mode */}
        <div className="rounded-xl border border-steel bg-graphite p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-paper flex items-center gap-2">
              <Terminal size={14} className="text-signal-blue" /> 2. Conexión Local (Claude Desktop / Cursor)
            </span>
            <button
              onClick={() => copyToClipboard(localNpxConfig, 'local')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-obsidian border border-steel text-xs text-ash hover:text-paper hover:border-signal-blue transition-colors"
            >
              {copiedSection === 'local' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedSection === 'local' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-[11px] text-ash">
            Ejecución del paquete local en <code className="text-paper bg-obsidian px-1 py-0.5 rounded">claude_desktop_config.json</code> o <code className="text-paper bg-obsidian px-1 py-0.5 rounded">.cursor/mcp.json</code>.
          </p>
          <pre className="bg-obsidian border border-steel p-3 rounded-lg text-xs font-mono text-ash overflow-x-auto max-h-56">
            {localNpxConfig}
          </pre>
        </div>
      </div>

      {/* Tools Quick Reference */}
      <div className="rounded-xl border border-steel bg-graphite p-5 space-y-3">
        <h4 className="text-xs font-semibold text-paper uppercase tracking-wider flex items-center gap-2">
          <Layers size={14} className="text-signal-blue" /> Herramientas Expuestas en Ambos Modos (22 Tools)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
          {[
            { name: 'nexora_get_customer_360', desc: 'Perfil unificado 360° del cliente' },
            { name: 'nexora_predict_deal_win', desc: 'Probabilidad de victoria de deal (%)' },
            { name: 'nexora_predict_churn_risk', desc: 'Riesgo de churn y retención' },
            { name: 'nexora_get_contact_summary', desc: 'Resumen ejecutivo con IA' },
            { name: 'nexora_generate_message_draft', desc: 'Redactor contextual de emails' },
            { name: 'nexora_list_contacts', desc: 'Búsqueda inteligente de contactos' },
            { name: 'nexora_list_deals', desc: 'Listar oportunidades en pipeline' },
            { name: 'nexora_list_tickets', desc: 'Tickets de soporte y SLA' },
            { name: 'nexora_list_products', desc: 'Catálogo de productos y precios' },
            { name: 'nexora_get_quote', desc: 'Desglose de cotización CPQ' },
            { name: 'nexora_search_knowledge_base', desc: 'Búsqueda en Base de Conocimiento' },
            { name: 'nexora_deal_review (Prompt)', desc: 'Workflow de auditoría de venta' },
          ].map((t) => (
            <div key={t.name} className="p-2.5 rounded-lg bg-obsidian border border-steel/60">
              <div className="font-mono text-signal-blue text-[11px] font-semibold">{t.name}</div>
              <div className="text-ash text-[11px] mt-0.5">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
