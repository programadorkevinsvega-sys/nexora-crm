'use client'

import { useState } from 'react'
import { Modal } from '@/src/presentation/crm/components/ui/Modal'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { Badge } from '@/src/presentation/crm/components/ui/Badge'
import { ApiDeveloperRepository, WEBHOOK_EVENTS } from '@/src/infrastructure/crm/repositories/developer/api-developer.repository'
import type { WebhookEndpoint, WebhookDeliveryLog, CreateWebhookEndpoint, WebhookEvent } from '@/src/infrastructure/crm/repositories/developer/api-developer.repository'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'

interface Props {
  webhooks: WebhookEndpoint[]
  onRefresh: () => void
}

const STATUS_BADGE = {
  SUCCESS: { variant: 'success' as const, icon: '✅' },
  FAILED: { variant: 'danger' as const, icon: '❌' },
  RETRYING: { variant: 'warning' as const, icon: '🔄' },
  PENDING: { variant: 'default' as const, icon: '⏳' },
}

export function WebhooksTab({ webhooks, onRefresh }: Props) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [logs, setLogs] = useState<{ endpointId: string; data: WebhookDeliveryLog[] } | null>(null)
  const [logsLoading, setLogsLoading] = useState(false)

  const toggleEvent = (e: WebhookEvent) =>
    setEvents((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]))

  const handleCreate = async () => {
    if (!name.trim() || !url.trim() || events.length === 0) return
    setSaving(true)
    try {
      const dto: CreateWebhookEndpoint = { name: name.trim(), url: url.trim(), events }
      await ApiDeveloperRepository.createWebhookEndpoint(dto)
      setCreating(false)
      setName('')
      setUrl('')
      setEvents([])
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await ApiDeveloperRepository.deleteWebhookEndpoint(deleteId)
    setDeleteId(null)
    onRefresh()
  }

  const handleViewLogs = async (endpointId: string) => {
    if (logs?.endpointId === endpointId) {
      setLogs(null)
      return
    }
    setLogsLoading(true)
    try {
      const data = await ApiDeveloperRepository.getDeliveryLogs(endpointId)
      setLogs({ endpointId, data })
    } finally {
      setLogsLoading(false)
    }
  }

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString('es-MX') : '—')

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>+ Nuevo Webhook</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-steel bg-graphite rekki-inset">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel text-ash">
              {['Nombre', 'URL', 'Eventos', 'Estado', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {webhooks.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ash">Sin webhooks configurados</td></tr>
            )}
            {webhooks.map((wh) => (
              <>
                <tr key={wh.id} className="border-b border-steel/40 hover:bg-iron/40 transition-colors">
                  <td className="px-4 py-3 text-paper font-medium">{wh.name}</td>
                  <td className="px-4 py-3 font-mono text-ash text-xs max-w-[200px] truncate" title={wh.url}>{wh.url}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(wh.events || []).map((e) => (
                        <Badge key={e} variant="default" size="sm">{e}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={wh.isActive ? 'success' : 'danger'}>{wh.isActive ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleViewLogs(wh.id)} disabled={logsLoading}>
                        {logs?.endpointId === wh.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        Ver entregas
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(wh.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
                {logs?.endpointId === wh.id && (
                  <tr key={`${wh.id}-logs`} className="bg-obsidian/50">
                    <td colSpan={5} className="px-6 py-3">
                      <p className="text-xs text-ash font-medium mb-2 uppercase tracking-wide">Entregas recientes</p>
                      {logs.data.length === 0 ? (
                        <p className="text-xs text-ash">Sin entregas registradas</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-ash">
                              {['Evento', 'Estado', 'HTTP', 'Duración', 'Timestamp'].map((h) => (
                                <th key={h} className="text-left py-1 pr-4 font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {logs.data.map((log) => {
                              const s = STATUS_BADGE[log.status]
                              return (
                                <tr key={log.id} className="border-t border-steel/20">
                                  <td className="py-1.5 pr-4 font-mono text-ash">{log.event}</td>
                                  <td className="py-1.5 pr-4">
                                    <Badge variant={s.variant} size="sm">{s.icon} {log.status}</Badge>
                                  </td>
                                  <td className="py-1.5 pr-4 text-ash">{log.responseStatus ?? '—'}</td>
                                  <td className="py-1.5 pr-4 text-ash">{log.durationMs != null ? `${log.durationMs}ms` : '—'}</td>
                                  <td className="py-1.5 text-ash">{fmt(log.createdAt)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Nuevo Webhook" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-ash mb-1 block">Nombre del endpoint</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mi servidor de eventos" />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">URL destino</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://mi-servidor.com/webhook" />
          </div>
          <div>
            <label className="text-xs text-ash mb-2 block">Eventos</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {WEBHOOK_EVENTS.map((ev) => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer text-sm text-ash hover:text-paper">
                  <input type="checkbox" checked={events.includes(ev)} onChange={() => toggleEvent(ev)} className="accent-signal-blue" />
                  {ev}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !name.trim() || !url.trim() || events.length === 0}>
              {saving ? 'Creando…' : 'Crear webhook'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar webhook" size="sm">
        <p className="text-ash text-sm mb-4">¿Estás seguro de que deseas eliminar este webhook? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
