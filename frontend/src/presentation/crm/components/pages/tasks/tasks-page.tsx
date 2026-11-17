"use client"

import { useState } from "react"
import { Plus, CheckCircle2, Circle, Phone, Mail, Calendar, CheckSquare, Clock } from "lucide-react"
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
import { FormInput, FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useTasksList, useCreateTask, useDeleteTask, useUpdateTask } from "@src/application/crm/di/hooks"

const taskSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, "La fecha límite es requerida"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  taskType: z.enum(["TODO", "CALL", "EMAIL", "MEETING", "FOLLOW_UP"]).default("TODO"),
})

type TaskFormData = z.infer<typeof taskSchema>

export function TasksListPage() {
  const { tenantId, userId } = useAuth()
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "MEDIUM", taskType: "TODO" },
  })

  const { data, isLoading, isError, error } = useTasksList({ assignedUserId: userId!, search })
  const { mutate: createTask, isPending: isCreating } = useCreateTask()
  const { mutate: deleteTask } = useDeleteTask()
  const { mutate: updateTask } = useUpdateTask()

  const typeIcons: Record<string, any> = {
    CALL: <Phone className="h-3.5 w-3.5 text-cyan-400" />,
    EMAIL: <Mail className="h-3.5 w-3.5 text-blue-400" />,
    MEETING: <Calendar className="h-3.5 w-3.5 text-purple-400" />,
    FOLLOW_UP: <Clock className="h-3.5 w-3.5 text-amber-400" />,
    TODO: <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />,
  }

  if (!userId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gestor de Tareas & Compromisos"
        description="Seguimiento de llamadas, reuniones y tareas comerciales con priorización SLA."
        actions={
          <Button onClick={() => setShowCreate(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva Tarea
          </Button>
        }
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar tareas por título..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((task: any) => (
            <Card key={task.id} className="p-4 space-y-3 bg-card border border-border">
              <div className="flex items-start gap-3">
                <button onClick={() => updateTask({ id: task.id, data: { isCompleted: !task.isCompleted } })} className="mt-0.5 shrink-0">
                  {task.isCompleted ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {typeIcons[task.taskType ?? "TODO"]}
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">{task.taskType || "TODO"}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      task.priority === "URGENT" ? "bg-rose-500/10 text-rose-400" :
                      task.priority === "HIGH" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                    }`}>{task.priority || "MEDIUM"}</span>
                  </div>
                  <p className={`text-sm font-medium text-foreground ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                  {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>Vence: {new Date(task.dueDate).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 h-7 text-xs" onClick={() => setDeleteId(task.id)}>Eliminar</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No tienes tareas pendientes" description="Crea tu primera tarea para organizar tu jornada comercial" />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear Nueva Tarea">
        <form onSubmit={handleSubmit((d) => createTask({ tenantId: tenantId!, ...d, dueDate: new Date(d.dueDate) } as any, { onSuccess: () => { setShowCreate(false); reset() } }))} className="space-y-4">
          <FormInput label="Título de la Tarea *" registration={register("title")} error={errors.title} required placeholder="ej. Llamar a director de Stripe para seguimiento" />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Tipo de Tarea" registration={register("taskType")} options={[
              { label: "Por Hacer (TODO)", value: "TODO" },
              { label: "Llamada Telefónica", value: "CALL" },
              { label: "Envío de Correo", value: "EMAIL" },
              { label: "Reunión Comercial", value: "MEETING" },
              { label: "Seguimiento Deal", value: "FOLLOW_UP" },
            ]} />
            <FormSelect label="Prioridad" registration={register("priority")} options={[
              { label: "Baja", value: "LOW" },
              { label: "Media", value: "MEDIUM" },
              { label: "Alta", value: "HIGH" },
              { label: "Urgente", value: "URGENT" },
            ]} />
          </div>
          <FormInput label="Fecha Límite *" type="date" registration={register("dueDate")} error={errors.dueDate} required />
          <FormInput label="Descripción / Notas" registration={register("description")} error={errors.description} placeholder="Detalles de la tarea..." />
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" disabled={isCreating} className="bg-cyan-600 hover:bg-cyan-500 text-white">{isCreating ? "Guardando..." : "Crear Tarea"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Eliminar tarea" message="¿Estás seguro de eliminar esta tarea?" confirmLabel="Eliminar" variant="danger" onConfirm={() => deleteId && deleteTask(deleteId, { onSuccess: () => setDeleteId(null) })} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
export default TasksListPage
