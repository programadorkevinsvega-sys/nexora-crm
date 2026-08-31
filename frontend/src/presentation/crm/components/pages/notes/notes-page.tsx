"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { FormInput } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useNotesList, useCreateNote, useDeleteNote } from "@src/application/crm/di/hooks"

const noteSchema = z.object({
  content: z.string().min(1, "Content is required").max(5000),
})

type NoteFormData = z.infer<typeof noteSchema>

export function NotesListPage() {
  const { tenantId, userId } = useAuth()
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  })

  const { data, isLoading, isError, error } = useNotesList({ tenantId: tenantId!, search })

  const { mutate: createNote, isPending: isCreating } = useCreateNote()
  const { mutate: deleteNote } = useDeleteNote()

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notes"
        description="Manage your notes"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        }
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Search notes..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((note: any) => (
            <Card key={note.id} className="p-4 space-y-2">
              <p className="text-body text-paper">{note.content}</p>
              <div className="flex items-center justify-between text-caption text-ash">
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(note.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No notes found" description="Create your first note to get started" />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Note">
        <form onSubmit={handleSubmit((data) => createNote(
          { tenantId: tenantId!, content: data.content, authorUserId: userId! },
          { onSuccess: () => { setShowCreate(false); reset() } }
        ))} className="space-y-4">
          <FormInput
            label="Content"
            registration={register("content")}
            error={errors.content}
            required
            placeholder="Write your note..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete note"
        message="Are you sure you want to delete this note?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteId) deleteNote(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default NotesListPage
