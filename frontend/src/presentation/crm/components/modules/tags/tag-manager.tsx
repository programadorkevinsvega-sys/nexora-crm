"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Pencil, Trash2, Plus } from "lucide-react"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { ApiTagRepository, type Tag } from "@/src/infrastructure/crm/repositories/tags/api-tag.repository"
import { ColorPickerField } from "@/src/presentation/crm/components/modules/tags/color-picker-field"

export interface TagManagerProps {
  tags: Tag[]
}

export function TagManager({ tags }: TagManagerProps) {
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#3b82f6")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () => ApiTagRepository.create({ tenantId: tenantId!, name: newName, color: newColor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      setNewName("")
      setNewColor("#3b82f6")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name, color }: { id: string; name: string; color: string }) =>
      ApiTagRepository.update(id, { name, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiTagRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      setDeleteId(null)
    },
  })

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <label className="text-caption text-ash font-medium">New Tag</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tag name" />
          </div>
          <ColorPickerField value={newColor} onChange={setNewColor} />
          <Button onClick={() => createMutation.mutate()} disabled={!newName || createMutation.isPending}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-2 rounded-full bg-iron px-3 py-1.5 group">
            {editingId === tag.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 w-28 text-xs"
                />
                <ColorPickerField value={editColor} onChange={setEditColor} />
                <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: tag.id, name: editName, color: editColor })}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            ) : (
              <>
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: tag.color ?? "#3b82f6" }}
                />
                <span className="text-body text-paper text-sm">{tag.name}</span>
                <button
                  onClick={() => { setEditingId(tag.id); setEditName(tag.name); setEditColor(tag.color ?? "#3b82f6") }}
                  className="hidden group-hover:inline-flex text-ash hover:text-paper"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeleteId(tag.id)}
                  className="hidden group-hover:inline-flex text-ash hover:text-[#f87171]"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete tag"
        message="Are you sure you want to delete this tag?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
