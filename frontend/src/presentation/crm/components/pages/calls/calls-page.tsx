"use client"

import { useState } from "react"
import { Plus, Phone, PhoneIncoming, PhoneOutgoing, Video, PhoneCall } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { FormInput, FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCallsList, useCreateCall } from "@src/application/crm/di/hooks"
import { useCall } from "@/src/application/crm/context/call-context"

const callSchema = z.object({
  callType: z.enum(["INBOUND", "OUTBOUND", "MEETING"]),
  happenedAt: z.string().min(1, "Date is required"),
  summary: z.string().max(2000).optional(),
})

type CallFormData = z.infer<typeof callSchema>

export function CallsListPage() {
  const { tenantId, userId } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [showDialer, setShowDialer] = useState(false)
  const [dialNumber, setDialNumber] = useState("")
  const [dialName, setDialName] = useState("")

  const { startCall } = useCall()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CallFormData>({
    resolver: zodResolver(callSchema),
    defaultValues: { callType: "OUTBOUND", happenedAt: new Date().toISOString().slice(0, 10) },
  })

  const { data, isLoading, isError, error } = useCallsList({ tenantId: tenantId! })
  const { mutate: createCall, isPending: isCreating } = useCreateCall()

  const callTypeIcons: Record<string, React.ReactNode> = {
    INBOUND: <PhoneIncoming className="h-4 w-4 text-emerald-500" />,
    OUTBOUND: <PhoneOutgoing className="h-4 w-4 text-signal-blue" />,
    MEETING: <Video className="h-4 w-4 text-purple-500" />,
  }

  const handleStartVoipCall = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dialNumber.trim()) return
    startCall(dialNumber.trim(), dialName.trim() || "Llamada Saliente")
    setShowDialer(false)
    setDialNumber("")
    setDialName("")
  }

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Registro de Llamadas & Telefonía VoIP"
        description="Historial de llamadas de voz, grabaciones en la nube y marcador WebRTC directo"
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowDialer(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs shadow-md shadow-emerald-600/20"
            >
              <PhoneCall className="h-4 w-4" />
              Llamar con 1 Clic (VoIP)
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Registrar Llamada Manual
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((call: any) => (
            <Card key={call.id} className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iron">
                {callTypeIcons[call.callType] ?? <Phone className="h-4 w-4 text-ash" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">{call.callType}</Badge>
                  <span className="text-caption text-ash">
                    {new Date(call.happenedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-body text-paper mt-1">{call.summary ?? "No summary"}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No hay llamadas registradas" description="Inicia una llamada VoIP o registra una llamada manual para comenzar" />
      )}

      {/* VoIP WebRTC Dialpad Modal */}
      <Modal open={showDialer} onClose={() => setShowDialer(false)} title="📞 Marcador VoIP (Click-to-Call Navegador)">
        <form onSubmit={handleStartVoipCall} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Número Telefónico con Código de País *</label>
            <input
              type="tel"
              required
              autoFocus
              placeholder="e.g. +1 800 555 0199 o +57 310 555 0199"
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 font-mono text-sm text-emerald-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Nombre del Prospecto / Cliente (Opcional)</label>
            <input
              type="text"
              placeholder="e.g. Carlos Gómez — Gerente Comercial"
              value={dialName}
              onChange={(e) => setDialName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-[11px]">
            🎙️ La llamada se establecerá a través de WebRTC con grabación dual y se guardará automáticamente en el historial del cliente.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowDialer(false)}>Cancelar</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-semibold">
              <PhoneCall className="h-4 w-4" />
              Conectar Llamada
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Call Log Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Llamada Manual">
        <form onSubmit={handleSubmit((data) => createCall(
          { tenantId: tenantId!, callType: data.callType, happenedAt: data.happenedAt, authorUserId: userId!, summary: data.summary || null },
          { onSuccess: () => { setShowCreate(false); reset() } }
        ))} className="space-y-4">
          <FormSelect label="Call Type" registration={register("callType")} error={errors.callType} required>
            <option value="INBOUND">Inbound</option>
            <option value="OUTBOUND">Outbound</option>
            <option value="MEETING">Meeting</option>
          </FormSelect>
          <FormInput label="Date" type="date" registration={register("happenedAt")} error={errors.happenedAt} required />
          <FormInput label="Summary" registration={register("summary")} error={errors.summary} placeholder="Call summary..." />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" disabled={isCreating}>{isCreating ? "Guardando..." : "Guardar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CallsListPage
