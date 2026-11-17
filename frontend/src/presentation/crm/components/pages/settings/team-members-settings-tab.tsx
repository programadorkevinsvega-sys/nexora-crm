'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/presentation/crm/components/ui/Card'
import { Button } from '@/src/presentation/crm/components/ui/Button'
import { Input } from '@/src/presentation/crm/components/ui/Input'
import { Avatar } from '@/src/presentation/crm/components/ui/Avatar'
import { Modal } from '@/src/presentation/crm/components/ui/Modal'
import { useSession } from '@/src/infrastructure/auth/auth-provider'
import { Users, UserPlus } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SALES_MANAGER' | 'AGENT' | 'SUPPORT_REP'
  status: 'ACTIVE' | 'INVITED'
  lastLogin: string
}

export function TeamMembersSettingsTab() {
  const { session } = useSession()
  const [members, setMembers] = useState<Member[]>([])
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'SALES_MANAGER' | 'AGENT' | 'SUPPORT_REP'>('AGENT')

  useEffect(() => {
    if (!session) return

    const storageKey = `crm_team_${session.tenantId}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        setMembers(JSON.parse(stored))
        return
      } catch (_) {}
    }

    // Default with the real logged in user
    const currentMember: Member = {
      id: session.userId,
      name: session.userName || 'Usuario Principal',
      email: session.userEmail || 'admin@crm.local',
      role: 'ADMIN',
      status: 'ACTIVE',
      lastLogin: 'Sesión actual activa',
    }
    setMembers([currentMember])
  }, [session])

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteName || !session) return
    const newMember: Member = {
      id: crypto.randomUUID(),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'INVITED',
      lastLogin: 'Invitación enviada',
    }
    const updated = [newMember, ...members]
    setMembers(updated)
    localStorage.setItem(`crm_team_${session.tenantId}`, JSON.stringify(updated))
    setIsInviteOpen(false)
    setInviteEmail('')
    setInviteName('')
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    SALES_MANAGER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    AGENT: 'bg-signal-blue/10 text-signal-blue border-signal-blue/20',
    SUPPORT_REP: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-steel/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-paper">Usuarios & Control de Acceso (RBAC)</h3>
            <p className="text-xs text-ash">
              Miembros registrados en el tenant ({members.length} usuario{members.length !== 1 ? 's' : ''})
            </p>
          </div>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className="gap-2 self-start">
          <UserPlus size={14} /> Invitar Miembro
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-steel/60 text-left text-ash uppercase tracking-wider font-semibold">
              <th className="pb-3">Usuario</th>
              <th className="pb-3">Rol</th>
              <th className="pb-3">Estado</th>
              <th className="pb-3">Último Acceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel/40">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-steel/20 transition-colors">
                <td className="py-3 pr-4 flex items-center gap-3">
                  <Avatar name={m.name} size="sm" />
                  <div>
                    <div className="font-semibold text-paper flex items-center gap-1.5">
                      {m.name}
                      {m.id === session?.userId && (
                        <span className="text-[10px] bg-signal-blue/20 text-signal-blue px-1.5 py-0.2 rounded font-medium">Tú</span>
                      )}
                    </div>
                    <div className="text-ash text-[11px]">{m.email}</div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleColors[m.role] || ''}`}>
                    {m.role}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {m.status === 'ACTIVE' ? 'Activo' : 'Invitación pendiente'}
                  </span>
                </td>
                <td className="py-3 text-ash">{m.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invitar Nuevo Miembro al CRM">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="text-xs text-ash mb-1 block">Nombre Completo</label>
            <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Ej. Ana Martínez" required />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Correo Corporativo</label>
            <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="ana@empresa.com" required />
          </div>
          <div>
            <label className="text-xs text-ash mb-1 block">Rol y Permisos</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="bg-obsidian border border-steel rounded-lg px-3 py-2 text-xs text-paper w-full focus:outline-none focus:border-signal-blue"
            >
              <option value="AGENT">Agente Comercial (Gestión de Deals y Contactos asignados)</option>
              <option value="SALES_MANAGER">Gerente de Ventas (Acceso a todos los Pipelines y Reportes)</option>
              <option value="SUPPORT_REP">Especialista de Soporte (Helpdesk y Tickets)</option>
              <option value="ADMIN">Administrador Total (Control de Facturación, Settings y API)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsInviteOpen(false)}>Cancelar</Button>
            <Button type="submit">Enviar Invitación</Button>
          </div>
        </form>
      </Modal>
    </Card>
  )
}
