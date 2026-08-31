"use client"

import { useState } from "react"
import { Plus, CheckCircle2, Circle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { FormInput } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useTasksList, useCreateTask, useDeleteTask, useUpdateTask } from "@src/application/crm/di/hooks"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
})

type TaskFormData = z.infer<typeof taskSchema>

export function TasksListPage() {
  const { tenantId, userId } = useAuth()
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  const { data, isLoading, isError, error } = useTasksList({ assignedUserId: userId!, search })

  const { mutate: createTask, isPending: isCreating } = useCreateTask()
  const { mutate: deleteTask } = useDeleteTask()
  const { mutate: updateTask } = useUpdateTask()

  if (!userId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tasks"
        description="Manage your tasks"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        }
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Search tasks..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((task: any) => (
            <Card key={task.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => updateTask({ id: task.id, data: { isCompleted: !task.isCompleted } })}
                  className="mt-0.5 shrink-0"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                  ) : (
                    <Circle className="h-5 w-5 text-ash hover:text-paper" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-body font-medium text-paper ${task.isCompleted ? "line-through text-ash" : ""}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-caption text-ash mt-1">{task.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-caption text-ash">
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(task.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No tasks found" description="Create your first task to get started" />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <form onSubmit={handleSubmit((data) => createTask(
          { tenantId: tenantId!, title: data.title, dueDate: data.dueDate, description: data.description || null, assignedUserId: userId! },
          { onSuccess: () => { setShowCreate(false); reset() } }
        ))} className="space-y-4">
          <FormInput
            label="Title"
            registration={register("title")}
            error={errors.title}
            required
            placeholder="Task title"
          />
          <FormInput
            label="Description"
            registration={register("description")}
            error={errors.description}
            placeholder="Task description"
          />
          <FormInput
            label="Due Date"
            type="date"
            registration={register("dueDate")}
            error={errors.dueDate}
            required
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
        title="Delete task"
        message="Are you sure you want to delete this task?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteId) deleteTask(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default TasksListPage
