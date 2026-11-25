"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListPipelinesUseCase } from "../../pipelines/queries/list-pipelines.use-case"
import type { GetPipelineBoardUseCase } from "../../pipelines/queries/get-pipeline-board.use-case"
import type { CreatePipelineUseCase } from "../../pipelines/use-cases/create-pipeline.use-case"
import type { UpdatePipelineUseCase } from "../../pipelines/use-cases/update-pipeline.use-case"
import type { DeletePipelineUseCase } from "../../pipelines/use-cases/delete-pipeline.use-case"
import type { CreateStageUseCase } from "../../pipelines/use-cases/create-stage.use-case"
import type { ReorderStagesUseCase } from "../../pipelines/use-cases/reorder-stages.use-case"

export function usePipelinesList(params?: Parameters<ListPipelinesUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["pipelines", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListPipelinesUseCase>(DI_TOKENS.ListPipelines)
      return unwrap(await uc.execute(params))
    },
  })
}

export function usePipelineBoard(pipelineId: string) {
  return useQuery({
    queryKey: ["pipelines", "board", pipelineId],
    queryFn: async () => {
      const uc = container.resolve<GetPipelineBoardUseCase>(DI_TOKENS.GetPipelineBoard)
      return unwrap(await uc.execute(pipelineId))
    },
    enabled: !!pipelineId,
  })
}

export function useCreatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreatePipelineUseCase['execute']>[0]) => {
      const uc = container.resolve<CreatePipelineUseCase>(DI_TOKENS.CreatePipeline)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline created", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdatePipelineUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdatePipelineUseCase>(DI_TOKENS.UpdatePipeline)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline updated", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeletePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeletePipelineUseCase>(DI_TOKENS.DeletePipeline)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline deleted", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCreateStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ pipelineId, data }: { pipelineId: string; data: Parameters<CreateStageUseCase['execute']>[1] }) => {
      const uc = container.resolve<CreateStageUseCase>(DI_TOKENS.CreateStage)
      return unwrap(await uc.execute(pipelineId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Stage created", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useReorderStages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ pipelineId, stageIds }: { pipelineId: string; stageIds: Parameters<ReorderStagesUseCase['execute']>[1] }) => {
      const uc = container.resolve<ReorderStagesUseCase>(DI_TOKENS.ReorderStages)
      return unwrap(await uc.execute(pipelineId, stageIds))
    },
    onSuccess: () => { useToastStore.getState().addToast("Stages reordered", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
