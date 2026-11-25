"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, RefreshCw, AlertCircle, Users } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { api } from "@/src/infrastructure/crm/api/api-client"
import { ApiCampaignRepository } from "@/src/infrastructure/crm/repositories/campaigns/api-campaign.repository"
import type { Campaign } from "@/src/domain/crm/campaigns/campaign.entity"
import type { CampaignMember } from "@/src/domain/crm/campaigns/campaign-member.entity"

type CampaignMemberStatus = CampaignMember['status']

const MEMBER_STATUSES: CampaignMemberStatus[] = [
  "SENT",
  "OPENED",
  "CLICKED",
  "RESPONDED",
  "BOUNCED",
  "UNSUBSCRIBED",
]

function parseMemberStatus(value: string): CampaignMemberStatus {
  const status = MEMBER_STATUSES.find((candidate) => candidate === value)
  if (!status) throw new TypeError(`Unsupported campaign member status: ${value}`)
  return status
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function CampaignSendPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [members, setMembers] = useState<CampaignMember[]>([])
  const [contactId, setContactId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCampaign = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [campaignData, memberPage] = await Promise.all([
        ApiCampaignRepository.getById(id),
        ApiCampaignRepository.listMembers(id, { limit: 200 }),
      ])
      setCampaign(campaignData)
      setMembers(memberPage.data)
    } catch (loadError: unknown) {
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadCampaign()
  }, [loadCampaign])

  const handleAddMember = async () => {
    const normalizedContactId = contactId.trim()
    if (!normalizedContactId) {
      setError("Ingresa el ID real del contacto que deseas agregar.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.post(`/api/campaigns/${id}/members`, { contactId: normalizedContactId })
      setContactId("")
      await loadCampaign()
    } catch (saveError: unknown) {
      setError(errorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (memberId: string, status: CampaignMemberStatus) => {
    setSaving(true)
    setError(null)
    try {
      await api.put(`/api/campaigns/members/${memberId}/status`, { status })
      await loadCampaign()
    } catch (updateError: unknown) {
      setError(errorMessage(updateError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/campaigns/${id}`)}>
            <ArrowLeft size={16} className="mr-1" /> Volver a Campaña
          </Button>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Miembros de campaña</h2>
            <p className="text-xs text-zinc-400">Gestión de destinatarios y estado registrado por el CRM</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadCampaign()} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin mr-2" : "mr-2"} /> Actualizar
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Card className="p-5 bg-zinc-950 border-zinc-800">
        {loading ? (
          <p className="text-sm text-zinc-400">Cargando campaña...</p>
        ) : campaign ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-zinc-400">Campaña</p>
              <p className="text-base font-semibold text-zinc-100">{campaign.name}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Estado</p>
              <p className="text-sm text-zinc-100">{campaign.status}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Tipo</p>
              <p className="text-sm text-zinc-100">{campaign.type ?? "No especificado"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">No se encontró la campaña.</p>
        )}
      </Card>

      <Card className="p-5 bg-zinc-950 border-zinc-800 space-y-4">
        <h3 className="font-semibold text-zinc-100 flex items-center gap-2"><Users size={16} /> Agregar contacto a la campaña</h3>
        <p className="text-xs text-zinc-400">El backend permite registrar un contacto por su ID. No se realiza envío de correo desde esta pantalla porque la API actual no expone un endpoint de envío masivo.</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={contactId}
            onChange={(event) => setContactId(event.target.value)}
            placeholder="ID del contacto"
            className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-100"
          />
          <Button onClick={handleAddMember} disabled={saving || loading || !campaign}>
            <Plus size={14} className="mr-2" /> Agregar
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-zinc-950 border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100">Contactos registrados</h3>
          <span className="text-xs text-zinc-400">{members.length} miembros</span>
        </div>
        {loading ? (
          <p className="text-sm text-zinc-400">Cargando miembros...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-zinc-400">Esta campaña todavía no tiene miembros.</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {members.map((member) => (
              <div key={member.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{member.contactId}</p>
                  <p className="text-xs text-zinc-500">Agregado: {new Date(member.createdAt).toLocaleDateString()}</p>
                </div>
                <select
                  value={member.status}
                  disabled={saving}
                  onChange={(event) => void handleStatusChange(member.id, parseMemberStatus(event.target.value))}
                  className="p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 text-xs"
                >
                  {MEMBER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default CampaignSendPage
