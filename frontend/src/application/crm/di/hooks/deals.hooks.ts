"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListDealsUseCase } from "../../deals/queries/list-deals.use-case"
import type { GetDealUseCase } from "../../deals/queries/get-deal.use-case"
import type { CreateDealUseCase } from "../../deals/use-cases/create-deal.use-case"
import type { UpdateDealUseCase } from "../../deals/use-cases/update-deal.use-case"
import type { DeleteDealUseCase } from "../../deals/use-cases/delete-deal.use-case"
import type { MoveDealUseCase } from "../../deals/use-cases/move-deal.use-case"
import type { WinDealUseCase } from "../../deals/use-cases/win-deal.use-case"
import type { LoseDealUseCase } from "../../deals/use-cases/lose-deal.use-case"

export function useDealsList(params?: Parameters<ListDealsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["deals", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListDealsUseCase>(DI_TOKENS.ListDeals)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ["deals", id],
    queryFn: async () => {
      const uc = container.resolve<GetDealUseCase>(DI_TOKENS.GetDeal)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateDealUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateDealUseCase>(DI_TOKENS.CreateDeal)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal created", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateDealUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateDealUseCase>(DI_TOKENS.UpdateDeal)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal updated", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteDealUseCase>(DI_TOKENS.DeleteDeal)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal deleted", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useMoveDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: Parameters<MoveDealUseCase['execute']>[1] }) => {
      const uc = container.resolve<MoveDealUseCase>(DI_TOKENS.MoveDeal)
      return unwrap(await uc.execute(dealId, stageId))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal moved", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useWinDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<WinDealUseCase>(DI_TOKENS.WinDeal)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal won", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useLoseDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: Parameters<LoseDealUseCase['execute']>[1] }) => {
      const uc = container.resolve<LoseDealUseCase>(DI_TOKENS.LoseDeal)
      return unwrap(await uc.execute(id, reason))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal lost", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
