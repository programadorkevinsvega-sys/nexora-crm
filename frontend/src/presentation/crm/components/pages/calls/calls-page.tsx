"use client"

import { useState } from "react"
import { Plus, Phone, PhoneIncoming, PhoneOutgoing, Video, PhoneCall, Sparkles } from "lucide-react"
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
  phoneNumber: z.string().optional().or(z.literal("")),
  happenedAt: z.string().min(1, "Date is required"),
  summary: z.string().max(2000).optional(),
  aiSummary: z.string().optional(),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).default("NEUTRAL"),
})

type CallFormData = z.infer<typeof callSchema>

export function CallsListPage() {
  const { tenantId } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [showDialer, setShowDialer] = useState(false)
  const [dialNumber, setDialNumber] = useState("")
  const [dialName, setDialName] = useState("")

  const { startCall } = useCall()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<
    z.input<typeof callSchema>,
    unknown,
    CallFormData
  >({
    resolver: zodResolver(callSchema),
    defaultValues: { callType: "OUTBOUND", happenedAt: new Date().toISOString().slice(0, 10), sentiment: "NEUTRAL" },
  })

  const { data, isLoading, isError, error } = useCallsList({ tenantId: tenantId! })
  const { mutate: createCall, isPending: isCreating } = useCreateCall()

  const callTypeIcons: Record<string, React.ReactNode> = {
    INBOUND: <PhoneIncoming className="h-4 w-4 text-emerald-500" />,
    OUTBOUND: <PhoneOutgoing className="h-4 w-4 text-cyan-500" />,
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
        title="Registro de Llamadas & VoIP con IA"
        description="Historial de llamadas de voz, análisis de sentimiento y resúmenes automáticos con IA."
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowDialer(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs">
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
            <Card key={call.id} className="p-4 flex items-start gap-4 bg-card border border-border">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted mt-1">
                {callTypeIcons[call.callType] ?? <Phone className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" size="sm">{call.callType}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{call.phoneNumber || "PBX Central"}</span>
                  <span className="text-xs text-muted-foreground">• {new Date(call.happenedAt).toLocaleDateString()}</span>
                  {call.sentiment && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      call.sentiment === "POSITIVE" ? "bg-emerald-500/10 text-emerald-400" :
                      call.sentiment === "NEGATIVE" ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-400"
                    }`}>
                      {call.sentiment}
                    </span>
                  )}
                </div>
                {call.summary && <p className="text-sm text-foreground">{call.summary}</p>}
                {call.aiSummary && (
                  <div className="mt-2 p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30 flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-cyan-300"><span className="font-semibold text-cyan-200">Resumen IA: </span>{call.aiSummary}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No hay llamadas registradas" description="Inicia una llamada VoIP con un clic o registra un log manual" />
      )}

      {/* Dialer Modal */}
      <Modal open={showDialer} onClose={() => setShowDialer(false)} title="Marcador WebRTC VoIP">
        <form onSubmit={handleStartVoipCall} className="space-y-4">
          <FormInput label="Número de Teléfono *" value={dialNumber} onChange={(e) => setDialNumber(e.target.value)} required placeholder="+57 300 123 4567" />
          <FormInput label="Nombre del Contacto (Opcional)" value={dialName} onChange={(e) => setDialName(e.target.value)} placeholder="Carlos Mendoza" />
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => setShowDialer(false)}>Cancelar</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"><PhoneCall className="h-4 w-4" /> Iniciar Llamada</Button>
          </div>
        </form>
      </Modal>

      {/* Manual Call Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Llamada Manual">
        <form onSubmit={handleSubmit((d) => createCall({ tenantId: tenantId!, ...d, happenedAt: new Date(d.happenedAt) } as any, { onSuccess: () => { setShowCreate(false); reset() } }))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Tipo de Llamada" registration={register("callType")} options={[{ label: "Saliente (Outbound)", value: "OUTBOUND" }, { label: "Entrante (Inbound)", value: "INBOUND" }, { label: "Videollamada", value: "MEETING" }]} />
            <FormInput label="Número Telefónico" registration={register("phoneNumber")} error={errors.phoneNumber} placeholder="+57 300 1234567" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Fecha y Hora *" type="date" registration={register("happenedAt")} error={errors.happenedAt} required />
            <FormSelect label="Sentimiento" registration={register("sentiment")} options={[{ label: "Positivo", value: "POSITIVE" }, { label: "Neutral", value: "NEUTRAL" }, { label: "Negativo", value: "NEGATIVE" }]} />
          </div>
          <FormInput label="Resumen / Minuta" registration={register("summary")} error={errors.summary} placeholder="Detalles clave de la conversación..." />
          <FormInput label="Resumen de IA (Opcional)" registration={register("aiSummary")} error={errors.aiSummary} placeholder="Puntos acordados según transcripción..." />
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" disabled={isCreating} className="bg-cyan-600 hover:bg-cyan-500 text-white">{isCreating ? "Guardando..." : "Guardar Registro"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default CallsListPage
