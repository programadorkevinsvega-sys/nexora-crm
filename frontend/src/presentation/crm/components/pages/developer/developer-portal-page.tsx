'use client'

import { useState, useEffect, useCallback } from 'react'
import { ApiKeysTab } from './api-keys-tab'
import { WebhooksTab } from './webhooks-tab'
import { DeveloperDocsTab } from './developer-docs-tab'
import { McpServerTab } from './mcp-server-tab'
import { ApiDeveloperRepository } from '@/src/infrastructure/crm/repositories/developer/api-developer.repository'
import type { ApiKey, WebhookEndpoint } from '@/src/infrastructure/crm/repositories/developer/api-developer.repository'
import { Key, Webhook, BookOpen, Bot, RefreshCw } from 'lucide-react'

type Tab = 'keys' | 'webhooks' | 'docs' | 'mcp'

export function DeveloperPortalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('keys')
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [k, w] = await Promise.all([
        ApiDeveloperRepository.listApiKeys(),
        ApiDeveloperRepository.listWebhookEndpoints(),
      ])
      setKeys(k)
      setWebhooks(w)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las claves de API y los webhooks.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-paper">Portal de Desarrolladores & IA</h1>
          <p className="text-sm text-ash mt-0.5">
            Gestiona tus API Keys, Webhooks con HMAC, la API Pública /api/v1 y el Servidor MCP para Agentes de Inteligencia Artificial.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-steel bg-graphite text-xs text-ash hover:text-paper hover:border-signal-blue transition-colors self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-steel/60 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px shrink-0 ${
            activeTab === 'keys'
              ? 'border-signal-blue text-signal-blue'
              : 'border-transparent text-ash hover:text-paper'
          }`}
        >
          <Key size={16} /> Claves de API ({keys.length})
        </button>

        <button
          onClick={() => setActiveTab('mcp')}
          className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px shrink-0 ${
            activeTab === 'mcp'
              ? 'border-signal-blue text-signal-blue'
              : 'border-transparent text-ash hover:text-paper'
          }`}
        >
          <Bot size={16} /> Servidor MCP (IA)
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px shrink-0 ${
            activeTab === 'webhooks'
              ? 'border-signal-blue text-signal-blue'
              : 'border-transparent text-ash hover:text-paper'
          }`}
        >
          <Webhook size={16} /> Webhooks Salientes ({webhooks.length})
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px shrink-0 ${
            activeTab === 'docs'
              ? 'border-signal-blue text-signal-blue'
              : 'border-transparent text-ash hover:text-paper'
          }`}
        >
          <BookOpen size={16} /> Documentación de la API
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'keys' && (
        <ApiKeysTab
          keys={keys}
          onRefresh={loadData}
          onKeyCreated={(k: any) => {
            const item: ApiKey = k?.apiKey || k
            setKeys((prev) => [item, ...prev])
          }}
        />
      )}

      {activeTab === 'mcp' && <McpServerTab apiKeys={keys} />}

      {activeTab === 'webhooks' && (
        <WebhooksTab webhooks={webhooks} onRefresh={loadData} />
      )}

      {activeTab === 'docs' && <DeveloperDocsTab />}
    </div>
  )
}
