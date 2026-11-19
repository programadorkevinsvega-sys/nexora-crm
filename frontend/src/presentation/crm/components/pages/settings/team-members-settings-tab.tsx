'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Avatar } from '@/src/presentation/crm/components/ui/Avatar'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { api, ApiError } from '@/src/infrastructure/crm/api/api-client'
import { Users, UserPlus, RefreshCw, ShieldAlert } from 'lucide-react'

interface MemberRole {
  id: string
  name: string
}

interface Member {
  id: string
  tenantId: string
  name: string
  email: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED'
  isEmailVerified: boolean
  lastLoginAt: string | null
  roles: MemberRole[]
}

interface TenantRole {
  id: string
  name: string
  description: string | null
}

export function TeamMembersSettingsTab() {
  const { session } = useSession()
  const [members, setMembers] = useState<Member[]>([])
  const [roles, setRoles] = useState<TenantRole[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!session?.userId || !session.tenantId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (search.trim()) params.set('search', search.trim())
      const [memberResponse, roleResponse] = await Promise.all([
        api.get<{ data: Member[]; nextCursor: string | null }>(`/api/tenant/team/members?${params.toString()}`),
        api.get<TenantRole[]>('/api/tenant/team/roles'),
      ])
      setMembers(Array.isArray(memberResponse.data) ? memberResponse.data : [])
      setRoles(Array.isArray(roleResponse) ? roleResponse : [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el equipo de la empresa.')
    } finally {
      setIsLoading(false)
    }
  }, [session?.userId, session?.tenantId, search])

  useEffect(() => {
    void load()
  }, [load])

  const handleRoleChange = async (memberId: string, roleId: string) => {
    if (!roleId) return
    setSavingMemberId(memberId)
    setError('')
    setNotice('')
    try {
      await api.put(`/api/tenant/team/members/${memberId}/role`, { roleId })
      setNotice('El rol del miembro se actualizó correctamente.')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el rol del miembro.')
      await load()
    } finally {
      setSavingMemberId(null)
    }
  }

  const roleLabel = (name: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador del tenant',
      manager: 'Gerente',
      agent: 'Agente',
      viewer: 'Solo lectura',
    }
    return labels[name.toLowerCase()] || name
  }

  const statusLabel = (status: Member['status']) => {
    const labels: Record<Member['status'], string> = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      SUSPENDED: 'Suspendido',
      BANNED: 'Bloqueado',
    }
    return labels[status] || status
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-steel/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-paper">Usuarios y roles de la empresa</h3>
            <p className="text-xs text-ash">
              Miembros persistidos en el tenant ({members.length} cargados)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void load()} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
          <Button variant="secondary" disabled title="Las invitaciones seguras se habilitarán con el flujo de aceptación por correo.">
            <UserPlus size={14} /> Invitar miembro
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
        <ShieldAlert size={16} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-ash">
          Las invitaciones todavía no están habilitadas. No se crearán usuarios ficticios en el navegador: el alta requiere un enlace de un solo uso, vencimiento y activación de contraseña.
        </p>
      </div>

      <div>
        <label htmlFor="team-search" className="text-xs text-ash mb-1.5 block">Buscar por nombre o correo</label>
        <input
          id="team-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar miembro..."
          className="w-full sm:max-w-sm bg-obsidian border border-steel rounded-lg px-3 py-2 text-xs text-paper focus:outline-none focus:border-signal-blue"
        />
      </div>

      {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
      {notice && <p role="status" className="text-xs text-emerald-400">{notice}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-steel/60 text-left text-ash uppercase tracking-wider font-semibold">
              <th className="pb-3 pr-4">Usuario</th>
              <th className="pb-3 pr-4">Rol</th>
              <th className="pb-3 pr-4">Estado</th>
              <th className="pb-3">Último acceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel/40">
            {isLoading ? (
              <tr><td colSpan={4} className="py-8 text-center text-ash">Cargando miembros...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-ash">No hay miembros que coincidan con la búsqueda.</td></tr>
            ) : members.map((member) => {
              const currentRole = member.roles[0]
              return (
                <tr key={member.id} className="hover:bg-steel/20 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="sm" />
                      <div>
                        <div className="font-semibold text-paper flex items-center gap-1.5">
                          {member.name}
                          {member.id === session?.userId && (
                            <span className="text-[10px] bg-signal-blue/20 text-signal-blue px-1.5 py-0.5 rounded font-medium">Tú</span>
                          )}
                        </div>
                        <div className="text-ash text-[11px]">{member.email}</div>
                        {!member.isEmailVerified && (
                          <div className="text-amber-400 text-[10px] mt-0.5">Correo sin verificar</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 min-w-[190px]">
                    <select
                      value={currentRole?.id || ''}
                      onChange={(event) => void handleRoleChange(member.id, event.target.value)}
                      disabled={savingMemberId === member.id || roles.length === 0 || member.status !== 'ACTIVE'}
                      aria-label={`Rol de ${member.email}`}
                      className="w-full bg-obsidian border border-steel rounded-lg px-2.5 py-2 text-xs text-paper focus:outline-none focus:border-signal-blue disabled:opacity-60"
                    >
                      <option value="" disabled>Sin rol asignado</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{roleLabel(role.name)}</option>
                      ))}
                    </select>
                    {savingMemberId === member.id && <span className="text-[10px] text-ash mt-1 block">Guardando...</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      member.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                      member.status === 'INACTIVE' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {statusLabel(member.status)}
                    </span>
                  </td>
                  <td className="py-3 text-ash">
                    {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : 'Sin acceso registrado'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
