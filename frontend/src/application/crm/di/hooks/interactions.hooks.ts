/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

// === Notes ===
export function useNotesList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["notes", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListNotes)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateNote)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note created", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateNote)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note updated", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteNote)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note deleted", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Tasks ===
export function useTasksList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["tasks", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListTasks)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateTask)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task created", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateTask)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task updated", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteTask)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task deleted", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Calls ===
export function useCallsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["calls", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListCalls)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateCall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateCall)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Call logged", "success"); qc.invalidateQueries({ queryKey: ["calls"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
