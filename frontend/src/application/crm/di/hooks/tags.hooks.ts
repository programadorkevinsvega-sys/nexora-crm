"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListTagsUseCase } from "../../tags/queries/list-tags.use-case"
import type { GetTagUseCase } from "../../tags/queries/get-tag.use-case"
import type { CreateTagUseCase } from "../../tags/use-cases/create-tag.use-case"
import type { UpdateTagUseCase } from "../../tags/use-cases/update-tag.use-case"
import type { DeleteTagUseCase } from "../../tags/use-cases/delete-tag.use-case"

export function useTagsList(params?: Parameters<ListTagsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["tags", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListTagsUseCase>(DI_TOKENS.ListTags)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useTag(id: string) {
  return useQuery({
    queryKey: ["tags", id],
    queryFn: async () => {
      const uc = container.resolve<GetTagUseCase>(DI_TOKENS.GetTag)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateTagUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateTagUseCase>(DI_TOKENS.CreateTag)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Tag created", "success"); qc.invalidateQueries({ queryKey: ["tags"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateTagUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateTagUseCase>(DI_TOKENS.UpdateTag)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Tag updated", "success"); qc.invalidateQueries({ queryKey: ["tags"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteTagUseCase>(DI_TOKENS.DeleteTag)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Tag deleted", "success"); qc.invalidateQueries({ queryKey: ["tags"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
