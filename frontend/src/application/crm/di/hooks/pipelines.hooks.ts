/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

export function usePipelinesList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["pipelines", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListPipelines)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function usePipelineBoard(pipelineId: string) {
  return useQuery({
    queryKey: ["pipelines", "board", pipelineId],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetPipelineBoard)
      return unwrap<any>(await uc.execute(pipelineId))
    },
    enabled: !!pipelineId,
  })
}

export function useCreatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreatePipeline)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline created", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdatePipeline)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline updated", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeletePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeletePipeline)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline deleted", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCreateStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ pipelineId, data }: { pipelineId: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateStage)
      return unwrap<any>(await uc.execute(pipelineId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Stage created", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useReorderStages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ pipelineId, stageIds }: { pipelineId: string; stageIds: string[] }) => {
      const uc = container.resolve<any>(DI_TOKENS.ReorderStages)
      return unwrap<void>(await uc.execute(pipelineId, stageIds))
    },
    onSuccess: () => { useToastStore.getState().addToast("Stages reordered", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
