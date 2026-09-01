/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

export function useDealsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["deals", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListDeals)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ["deals", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetDeal)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateDeal)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal created", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateDeal)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal updated", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteDeal)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal deleted", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useMoveDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const uc = container.resolve<any>(DI_TOKENS.MoveDeal)
      return unwrap<any>(await uc.execute(dealId, stageId))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal moved", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useWinDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.WinDeal)
      return unwrap<any>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal won", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useLoseDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const uc = container.resolve<any>(DI_TOKENS.LoseDeal)
      return unwrap<any>(await uc.execute(id, reason))
    },
    onSuccess: () => { useToastStore.getState().addToast("Deal lost", "success"); qc.invalidateQueries({ queryKey: ["deals"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
