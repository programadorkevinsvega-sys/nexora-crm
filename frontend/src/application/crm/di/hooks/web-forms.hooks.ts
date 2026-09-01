/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToastStore } from "@/src/presentation/components/toast"
import { ApiWebFormsRepository } from "@/src/infrastructure/crm/repositories/web-forms/api-web-forms.repository"
import type { CreateWebForm, UpdateWebForm } from "@crm/contracts"

export function useWebFormsList() {
  return useQuery({
    queryKey: ["web-forms", "list"],
    queryFn: async () => ApiWebFormsRepository.list(),
  })
}

export function useWebForm(id: string) {
  return useQuery({
    queryKey: ["web-forms", id],
    queryFn: async () => ApiWebFormsRepository.getById(id),
    enabled: !!id,
  })
}

export function useCreateWebForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateWebForm) => ApiWebFormsRepository.create(data),
    onSuccess: () => {
      useToastStore.getState().addToast("Formulario creado exitosamente", "success")
      qc.invalidateQueries({ queryKey: ["web-forms"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al crear", "error"),
  })
}

export function useUpdateWebForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWebForm }) => ApiWebFormsRepository.update(id, data),
    onSuccess: () => {
      useToastStore.getState().addToast("Formulario actualizado exitosamente", "success")
      qc.invalidateQueries({ queryKey: ["web-forms"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al actualizar", "error"),
  })
}

export function useDeleteWebForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => ApiWebFormsRepository.delete(id),
    onSuccess: () => {
      useToastStore.getState().addToast("Formulario eliminado", "success")
      qc.invalidateQueries({ queryKey: ["web-forms"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al eliminar", "error"),
  })
}

export function useWebFormSubmissions(formId: string) {
  return useQuery({
    queryKey: ["web-forms", formId, "submissions"],
    queryFn: async () => ApiWebFormsRepository.getSubmissions(formId),
    enabled: !!formId,
  })
}

export function usePublicWebForm(idOrSlug: string) {
  return useQuery({
    queryKey: ["public-web-forms", idOrSlug],
    queryFn: async () => ApiWebFormsRepository.getPublicForm(idOrSlug),
    enabled: !!idOrSlug,
  })
}
