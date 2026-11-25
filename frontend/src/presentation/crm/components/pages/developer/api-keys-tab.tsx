'use client'

import { useState } from 'react'
import { Modal } from '@/src/presentation/crm/components/ui/Modal'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { Badge } from '@/src/presentation/crm/components/ui/Badge'
import { ApiDeveloperRepository, API_KEY_SCOPES } from '@/src/infrastructure/crm/repositories/developer/api-developer.repository'
import type { ApiKey, CreatedApiKey, CreateApiKey, ApiKeyScope } from '@/src/infrastructure/crm/repositories/developer/api-developer.repository'
import { Copy, Check, AlertTriangle, Trash2, Ban } from 'lucide-react'

const SCOPE_LABELS: Record<string, string> = {
  'contacts:read': 'Contactos (lectura)', 'contacts:write': 'Contactos (escritura)',
  'companies:read': 'Empresas (lectura)', 'companies:write': 'Empresas (escritura)',
  'deals:read': 'Deals (lectura)', 'deals:write': 'Deals (escritura)',
  'interactions:read': 'Interacciones (lectura)', 'interactions:write': 'Interacciones (escritura)',
  'tickets:read': 'Tickets (lectura)', 'tickets:write': 'Tickets (escritura)',
  'quotes:read': 'Cotizaciones (lectura)', 'quotes:write': 'Cotizaciones (crear)',
  'contracts:read': 'Contratos (lectura)', 'contracts:write': 'Contratos (crear)',
  'campaigns:read': 'Campañas (lectura)', 'campaigns:write': 'Campañas (gestión)',
  'scoring:read': 'Scoring (lectura)', 'scoring:write': 'Scoring (recalcular)',
  'kb:read': 'KB (lectura)', 'ai:read': 'IA (lectura)', 'ai:write': 'IA (generar)',
  'webhooks:manage': 'Webhooks (gestión)',
}

interface Props {
  keys: ApiKey[]
  onRefresh: () => void
  onKeyCreated: (key: CreatedApiKey) => void
}

export function ApiKeysTab({ keys, onRefresh, onKeyCreated }: Props) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<ApiKeyScope[]>([])
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [revealedKey, setRevealedKey] = useState<CreatedApiKey | null>(null)
  const [copied, setCopied] = useState(false)

  const toggleScope = (s: ApiKeyScope) =>
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const selectAllScopes = () => {
    setScopes(scopes.length === API_KEY_SCOPES.length ? [] : [...API_KEY_SCOPES])
  }

  const handleCreate = async () => {
    if (!name.trim() || scopes.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const formattedExpiry = expiresAt ? new Date(expiresAt).toISOString() : undefined
      const dto: CreateApiKey = {
        name: name.trim(),
        scopes,
        ...(formattedExpiry ? { expiresAt: formattedExpiry } : {}),
      }
      const created = await ApiDeveloperRepository.createApiKey(dto)
      setRevealedKey(created)
      setCreating(false)
      setName('')
      setScopes([])
      setExpiresAt('')
      onKeyCreated(created)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la clave de API')
    } finally {
      setSaving(false)
    }
  }

  const handleRevoke = async () => {
    if (!revokeId) return
    try {
      await ApiDeveloperRepository.revokeApiKey(revokeId)
      setRevokeId(null)
      onRefresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al revocar la clave')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await ApiDeveloperRepository.deleteApiKey(deleteId)
      setDeleteId(null)
      onRefresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la clave de API')
    }
  }

  const handleCopy = () => {
    if (revealedKey) {
      navigator.clipboard.writeText(revealedKey.rawKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('es-MX') : '—')

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setCreating(true); setError(null) }}>+ Nueva Clave de API</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-steel bg-graphite rekki-inset">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel text-ash">
              {['Nombre', 'Prefijo', 'Scopes', 'Último uso', 'Expira', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ash">Sin claves de API</td></tr>
            )}
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-steel/40 hover:bg-iron/40 transition-colors">
                <td className="px-4 py-3 text-paper font-medium">{k.name}</td>
                <td className="px-4 py-3 font-mono text-ash text-xs">{k.keyPrefix}…</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(k.scopes || []).map((s) => (
                      <Badge key={s} variant="info" size="sm">{s}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-ash">{fmt(k.lastUsedAt)}</td>
                <td className="px-4 py-3 text-ash">{fmt(k.expiresAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={k.isActive ? 'success' : 'danger'}>{k.isActive ? 'Activa' : 'Inactiva'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {k.isActive && (
                      <Button variant="secondary" size="sm" onClick={() => setRevokeId(k.id)} title="Desactivar temporalmente">
                        <Ban size={13} /> Revocar
                      </Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => setDeleteId(k.id)} title="Eliminar definitivamente de la base de datos">
                      <Trash2 size={13} /> Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Nueva Clave de API" size="md">
        <div className="space-y-4">
          {error && <div className="rounded-lg bg-red-950/50 border border-red-800 p-3 text-xs text-red-300">{error}</div>}
          <div>
            <label className="text-xs text-ash mb-1 block">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Integración ERP, Portal..." />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-ash block">Scopes (Permisos)</label>
              <button type="button" onClick={selectAllScopes} className="text-xs text-signal-blue hover:underline">
                {scopes.length === API_KEY_SCOPES.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {API_KEY_SCOPES.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-xs text-ash hover:text-paper">
                  <input type="checkbox" checked={scopes.includes(s)} onChange={() => toggleScope(s)} className="accent-signal-blue" />
                  {SCOPE_LABELS[s] ?? s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Fecha de expiración (opcional)</label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !name.trim() || scopes.length === 0}>
              {saving ? 'Creando…' : 'Crear clave'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* One-time reveal modal */}
      <Modal open={!!revealedKey} onClose={() => setRevealedKey(null)} title="Clave creada" size="lg">
        {revealedKey && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-[#2a1f0a] border border-[#5a3f0a] p-3">
              <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-yellow-300">Esta clave solo se muestra una vez. Guárdala en un lugar seguro ahora.</p>
            </div>
            <div className="rounded-lg bg-obsidian border border-steel p-3 font-mono text-sm text-signal-blue break-all">
              {revealedKey.rawKey}
            </div>
            <Button variant="secondary" onClick={handleCopy} className="w-full gap-2">
              {copied ? <><Check size={14} /> Copiado al portapapeles</> : <><Copy size={14} /> Copiar clave completa</>}
            </Button>
            <Button className="w-full" onClick={() => setRevealedKey(null)}>Entendido, ya la guardé</Button>
          </div>
        )}
      </Modal>

      {/* Revoke confirm modal */}
      <Modal open={!!revokeId} onClose={() => setRevokeId(null)} title="Revocar clave" size="sm">
        <p className="text-ash text-xs mb-4">¿Deseas revocar esta clave? Quedará inactiva y no podrá ser utilizada en llamadas a la API.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRevokeId(null)}>Cancelar</Button>
          <Button variant="secondary" onClick={handleRevoke}>Revocar Clave</Button>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar clave permanentemente" size="sm">
        <p className="text-ash text-xs mb-4">¿Estás seguro de que deseas eliminar definitivamente esta clave de API? Se borrará completamente de la base de datos.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar definitivamente</Button>
        </div>
      </Modal>
    </div>
  )
}
