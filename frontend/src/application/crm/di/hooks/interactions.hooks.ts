"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListNotesUseCase } from "../../notes/queries/list-notes.use-case"
import type { CreateNoteUseCase } from "../../notes/use-cases/create-note.use-case"
import type { UpdateNoteUseCase } from "../../notes/use-cases/update-note.use-case"
import type { DeleteNoteUseCase } from "../../notes/use-cases/delete-note.use-case"
import type { ListTasksUseCase } from "../../tasks/queries/list-tasks.use-case"
import type { CreateTaskUseCase } from "../../tasks/use-cases/create-task.use-case"
import type { UpdateTaskUseCase } from "../../tasks/use-cases/update-task.use-case"
import type { DeleteTaskUseCase } from "../../tasks/use-cases/delete-task.use-case"
import type { ListCallsUseCase } from "../../calls/queries/list-calls.use-case"
import type { CreateCallUseCase } from "../../calls/use-cases/create-call.use-case"

// === Notes ===
export function useNotesList(params?: Parameters<ListNotesUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["notes", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListNotesUseCase>(DI_TOKENS.ListNotes)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateNoteUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateNoteUseCase>(DI_TOKENS.CreateNote)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note created", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateNoteUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateNoteUseCase>(DI_TOKENS.UpdateNote)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note updated", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteNoteUseCase>(DI_TOKENS.DeleteNote)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note deleted", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Tasks ===
export function useTasksList(params?: Parameters<ListTasksUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["tasks", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListTasksUseCase>(DI_TOKENS.ListTasks)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateTaskUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateTaskUseCase>(DI_TOKENS.CreateTask)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task created", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateTaskUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateTaskUseCase>(DI_TOKENS.UpdateTask)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task updated", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteTaskUseCase>(DI_TOKENS.DeleteTask)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task deleted", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Calls ===
export function useCallsList(params?: Parameters<ListCallsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["calls", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListCallsUseCase>(DI_TOKENS.ListCalls)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateCall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateCallUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateCallUseCase>(DI_TOKENS.CreateCall)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Call logged", "success"); qc.invalidateQueries({ queryKey: ["calls"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
