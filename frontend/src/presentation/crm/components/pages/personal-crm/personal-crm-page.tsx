"use client"

import { useState, useEffect } from "react"
import { Cake, Gift, Clock, Plus, Calendar, Sparkles, CheckCircle2, RefreshCw, Eye, Trash2 } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import {
  ApiPersonalCrmRepository,
  LifeEvent,
  GiftIdea,
  RelationshipReminder,
} from "@/src/infrastructure/crm/repositories/personal-crm/api-personal-crm.repository"

export function PersonalCrmPage() {
  const [activeTab, setActiveTab] = useState<"EVENTS" | "GIFTS" | "REMINDERS">("EVENTS")
  const [events, setEvents] = useState<LifeEvent[]>([])
  const [gifts, setGifts] = useState<GiftIdea[]>([])
  const [reminders, setReminders] = useState<RelationshipReminder[]>([])
  const [loading, setLoading] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewItem, setViewItem] = useState<{ type: string; data: any } | null>(null)

  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formValue, setFormValue] = useState("")
  const [formEventType, setFormEventType] = useState("BIRTHDAY")
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [evRes, gfRes, rmRes] = await Promise.all([
        ApiPersonalCrmRepository.listLifeEvents(),
        ApiPersonalCrmRepository.listGifts(),
        ApiPersonalCrmRepository.listReminders(),
      ])
      setEvents(evRes.data || [])
      setGifts(gfRes.data || [])
      setReminders(rmRes.data || [])
    } catch (err) {
      console.error("Failed to load Personal CRM data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleToggleReminder = async (id: string) => {
    try {
      await ApiPersonalCrmRepository.toggleReminder(id)
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)))
    } catch (err) {
      console.error("Failed to toggle reminder:", err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (activeTab === "EVENTS") {
        await ApiPersonalCrmRepository.createLifeEvent({
          contactId: "00000000-0000-0000-0000-000000000001",
          name: formName,
          eventType: formEventType,
          happenedAt: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
          description: formDesc || undefined,
        })
      } else if (activeTab === "GIFTS") {
        await ApiPersonalCrmRepository.createGift({
          contactId: "00000000-0000-0000-0000-000000000001",
          name: formName,
          direction: "GIVEN",
          description: formDesc || undefined,
          estimatedValue: formValue ? Number(formValue) : undefined,
          status: "IDEA",
        })
      } else {
        await ApiPersonalCrmRepository.createReminder({
          contactId: "00000000-0000-0000-0000-000000000001",
          title: formName,
          frequencyType: "MONTHLY",
          nextDueDate: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
        })
      }
      setShowCreateModal(false)
      setFormName(""); setFormDesc(""); setFormDate(""); setFormValue("")
      loadData()
    } catch (err) {
      console.error("Failed to create record:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> CRM Personal y Vínculo Humano
          </h1>
          <p className="text-xs text-muted-foreground">Momentos clave, aniversarios, ideas de obsequios y cadencias de contacto.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-1 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Actualizar
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Nuevo Registro
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab("EVENTS")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${activeTab === "EVENTS" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
          <Cake className="h-3.5 w-3.5" /> Eventos ({events.length})
        </button>
        <button onClick={() => setActiveTab("GIFTS")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${activeTab === "GIFTS" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
          <Gift className="h-3.5 w-3.5" /> Regalos ({gifts.length})
        </button>
        <button onClick={() => setActiveTab("REMINDERS")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${activeTab === "REMINDERS" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
          <Clock className="h-3.5 w-3.5" /> Recordatorios ({reminders.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-36" /><Skeleton className="h-36" /></div>
      ) : activeTab === "EVENTS" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <Card key={e.id} className="p-4 border shadow-sm space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between"><Badge variant="secondary" className="text-[10px]">{e.eventType}</Badge><span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono"><Calendar className="h-3 w-3" /> {e.happenedAt ? new Date(e.happenedAt).toLocaleDateString() : "Periódico"}</span></div>
                <h3 className="font-bold text-sm text-foreground">{e.name}</h3>
                {e.description && <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>}
              </div>
              <div className="flex justify-end pt-2 border-t"><Button variant="ghost" size="sm" onClick={() => setViewItem({ type: "Evento de Vida", data: e })} className="h-7 text-xs gap-1"><Eye className="h-3 w-3" /> Ver Detalle</Button></div>
            </Card>
          ))}
        </div>
      ) : activeTab === "GIFTS" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gifts.map((g) => (
            <Card key={g.id} className="p-4 border shadow-sm space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between"><Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">{g.status}</Badge>{g.estimatedValue != null && <span className="font-bold font-mono text-xs text-emerald-600">${g.estimatedValue}</span>}</div>
                <h3 className="font-bold text-sm text-foreground">{g.name}</h3>
                {g.description && <p className="text-xs text-muted-foreground line-clamp-2">{g.description}</p>}
              </div>
              <div className="flex justify-end pt-2 border-t"><Button variant="ghost" size="sm" onClick={() => setViewItem({ type: "Idea de Regalo", data: g })} className="h-7 text-xs gap-1"><Eye className="h-3 w-3" /> Ver Detalle</Button></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <Card key={r.id} className={`p-3.5 border flex items-center justify-between transition-colors ${!r.isActive ? "bg-muted/10 opacity-70" : "bg-card"}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleReminder(r.id)} className={`h-5 w-5 rounded border flex items-center justify-center ${!r.isActive ? "bg-emerald-500 text-white border-emerald-500" : "border-input hover:border-primary"}`}>
                  {!r.isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <div>
                  <p className={`text-xs font-semibold ${!r.isActive ? "line-through text-muted-foreground" : "text-foreground"}`}>{r.title}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">Vence: {r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString() : r.frequencyType}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewItem({ type: "Recordatorio", data: r })} className="h-7 text-xs gap-1"><Eye className="h-3 w-3" /> Detalle</Button>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nuevo Registro */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title={`Nuevo Registro — ${activeTab === "EVENTS" ? "Evento de Vida" : activeTab === "GIFTS" ? "Idea de Regalo" : "Recordatorio"}`}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5"><label className="text-xs font-semibold">Nombre / Título *</label><input required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ej. Cumpleaños, Aniversario, Regalo Premium" className="w-full rounded-lg border border-input bg-background p-2 text-xs" /></div>
          {activeTab === "EVENTS" && (
            <div className="space-y-1.5"><label className="text-xs font-semibold">Tipo de Evento</label><select value={formEventType} onChange={(e) => setFormEventType(e.target.value)} className="w-full rounded-lg border border-input bg-background p-2 text-xs"><option value="BIRTHDAY">Cumpleaños</option><option value="ANNIVERSARY">Aniversario Laboral / Comercial</option><option value="MILESTONE">Hito Clave</option></select></div>
          )}
          {activeTab === "GIFTS" && (
            <div className="space-y-1.5"><label className="text-xs font-semibold">Valor Estimado ($)</label><input type="number" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-input bg-background p-2 text-xs" /></div>
          )}
          {activeTab !== "GIFTS" && (
            <div className="space-y-1.5"><label className="text-xs font-semibold">Fecha</label><input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full rounded-lg border border-input bg-background p-2 text-xs" /></div>
          )}
          <div className="space-y-1.5"><label className="text-xs font-semibold">Descripción / Notas</label><textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Detalles adicionales..." className="w-full rounded-lg border border-input bg-background p-2 text-xs" /></div>
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>Cancelar</Button><Button type="submit" disabled={saving || !formName.trim()}>{saving ? "Guardando..." : "Crear Registro"}</Button></div>
        </form>
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title={viewItem?.type || "Detalle"}>
        {viewItem && (
          <div className="space-y-3">
            <div className="p-3 bg-muted/40 rounded-lg space-y-2 text-xs">
              <p className="font-bold text-sm text-foreground">{viewItem.data.name || viewItem.data.title}</p>
              {viewItem.data.description && <p className="text-muted-foreground whitespace-pre-wrap">{viewItem.data.description}</p>}
              {viewItem.data.happenedAt && <p className="font-mono text-muted-foreground">Fecha: {new Date(viewItem.data.happenedAt).toLocaleDateString()}</p>}
              {viewItem.data.nextDueDate && <p className="font-mono text-muted-foreground">Próximo Vencimiento: {new Date(viewItem.data.nextDueDate).toLocaleDateString()}</p>}
              {viewItem.data.estimatedValue != null && <p className="font-mono text-emerald-600 font-bold">Valor: ${viewItem.data.estimatedValue}</p>}
            </div>
            <div className="flex justify-end pt-2"><Button onClick={() => setViewItem(null)}>Cerrar</Button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
export default PersonalCrmPage
