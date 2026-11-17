/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

export function useAffiliatesList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["affiliates", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListAffiliates)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useAffiliate(id: string) {
  return useQuery({
    queryKey: ["affiliates", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetAffiliate)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateAffiliate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateAffiliate)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Affiliate created", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useProgramsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["affiliates", "programs", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListPrograms)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: ["affiliates", "programs", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetProgram)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateProgram)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Program created", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateProgram)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Program updated", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteProgram)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Program deleted", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCommissionsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["affiliates", "commissions", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListCommissions)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateCommission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateCommission)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Commission created", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function usePayoutsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["affiliates", "payouts", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListPayouts)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreatePayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreatePayout)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Payout created", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
