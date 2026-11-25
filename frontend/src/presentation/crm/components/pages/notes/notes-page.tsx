"use client"

import { useState } from "react"
import { Plus, Calendar } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useNotesList, useCreateNote, useDeleteNote } from "@src/application/crm/di/hooks"

export function NotesListPage() {
  const { tenantId, userId } = useAuth()
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formContent, setFormContent] = useState("")

  const { data, isLoading, isError, error, refetch } = useNotesList({ tenantId: tenantId ?? undefined, search })
  const { mutate: createNote, isPending: isCreating } = useCreateNote()
  const { mutate: deleteNote } = useDeleteNote()

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!tenantId || !userId || !formContent.trim()) return
    createNote(
      { tenantId, content: formContent.trim(), authorUserId: userId },
      { onSuccess: () => { setShowCreate(false); setFormContent(""); refetch() } },
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notas de Seguimiento"
        description="Anotaciones de seguimiento asociadas al tenant."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Nueva Nota
          </Button>
        }
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar en notas..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((note) => (
            <Card key={note.id} className="p-4 flex flex-col justify-between space-y-3 bg-card border border-border">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="h-3 w-3 text-primary" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
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
        <EmptyState title="No hay notas registradas" description="Crea una nota para guardar acuerdos o detalles de seguimiento." />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear Nota de Seguimiento">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-caption text-foreground font-medium block mb-1">Contenido de la Nota *</label>
            <textarea
              className="h-28 w-full rounded-md bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={formContent}
              onChange={(event) => setFormContent(event.target.value)}
              placeholder="Escribe los acuerdos o detalles clave de la interacción..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" disabled={!formContent.trim() || isCreating || !userId}>Guardar Nota</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar nota"
        message="¿Estás seguro de eliminar esta nota?"
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => deleteId && deleteNote(deleteId, { onSuccess: () => { setDeleteId(null); refetch() } })}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default NotesListPage
