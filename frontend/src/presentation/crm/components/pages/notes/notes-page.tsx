"use client"

import { useState } from "react"
import { Plus, Pin, Lock, Smile, Meh, Frown, Calendar } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useNotesList, useCreateNote, useDeleteNote } from "@src/application/crm/di/hooks"
import type { NoteSentiment } from "@/src/domain/crm/interactions/note.entity"

export function NotesListPage() {
  const { tenantId, userId } = useAuth()
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formContent, setFormContent] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [sentiment, setSentiment] = useState<"POSITIVE" | "NEUTRAL" | "NEGATIVE">("NEUTRAL")

  const { data, isLoading, isError, error, refetch } = useNotesList({ tenantId: tenantId ?? undefined, search })
  const { mutate: createNote, isPending: isCreating } = useCreateNote()
  const { mutate: deleteNote } = useDeleteNote()

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId || !userId) return
    createNote(
      { tenantId, content: formContent, authorUserId: userId, isPinned, isPrivate, sentiment },
      { onSuccess: () => { setShowCreate(false); setFormContent(""); refetch() } }
    )
  }

  const sentimentBadge = (s: string) => {
    if (s === "POSITIVE") return <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded"><Smile className="h-3 w-3" /> Positivo</span>
    if (s === "NEGATIVE") return <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded"><Frown className="h-3 w-3" /> Negativo</span>
    return <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded"><Meh className="h-3 w-3" /> Neutral</span>
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notas de Seguimiento & Bitácora"
        description="Anotaciones privadas, notas fijadas y análisis de sentimiento comercial."
        actions={
          <Button onClick={() => setShowCreate(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva Nota
          </Button>
        }
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar en notas..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((note) => (
            <Card key={note.id} className={`p-4 flex flex-col justify-between space-y-3 bg-card border ${note.isPinned ? "border-amber-500/40 bg-amber-500/5" : "border-border"}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="h-3 w-3 text-primary" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {note.isPinned && <span title="Fijada"><Pin className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /></span>}
                    {note.isPrivate && <span title="Privada"><Lock className="h-3.5 w-3.5 text-cyan-400" /></span>}
                    {sentimentBadge(note.sentiment || "NEUTRAL")}
                  </div>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
              </div>
              <div className="flex justify-end pt-2 border-t border-border">
                <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 h-7 text-xs" onClick={() => setDeleteId(note.id)}>Eliminar</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No hay notas registradas" description="Crea notas de seguimiento para enriquecer la bitácora de tus clientes" />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear Nota de Seguimiento">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-caption text-foreground font-medium block mb-1">Contenido de la Nota *</label>
            <textarea
              className="h-28 w-full rounded-md bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Escribe los acuerdos o detalles clave de la interacción..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-caption text-foreground font-medium block mb-1">Sentimiento</label>
              <select value={sentiment} onChange={(e) => setSentiment(e.target.value as NoteSentiment)} className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground">
                <option value="POSITIVE">Positivo / Oportunidad Clara</option>
                <option value="NEUTRAL">Neutral / Informativo</option>
                <option value="NEGATIVE">Negativo / Objeción o Riesgo</option>
              </select>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
                <span>Fijar nota</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
                <span>Nota privada</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" disabled={!formContent || isCreating} className="bg-cyan-600 hover:bg-cyan-500 text-white">Guardar Nota</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Eliminar nota" message="¿Estás seguro de eliminar esta nota?" confirmLabel="Eliminar" variant="danger" onConfirm={() => deleteId && deleteNote(deleteId, { onSuccess: () => { setDeleteId(null); refetch() } })} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
export default NotesListPage
