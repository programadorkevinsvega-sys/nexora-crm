"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListAffiliatesUseCase } from "../../affiliates/queries/list-affiliates.use-case"
import type { GetAffiliateUseCase } from "../../affiliates/queries/get-affiliate.use-case"
import type { CreateAffiliateUseCase } from "../../affiliates/use-cases/create-affiliate.use-case"
import type { ListProgramsUseCase } from "../../affiliates/queries/list-programs.use-case"
import type { GetProgramUseCase } from "../../affiliates/queries/get-program.use-case"
import type { CreateProgramUseCase } from "../../affiliates/use-cases/create-program.use-case"
import type { UpdateProgramUseCase } from "../../affiliates/use-cases/update-program.use-case"
import type { DeleteProgramUseCase } from "../../affiliates/use-cases/delete-program.use-case"
import type { ListCommissionsUseCase } from "../../affiliates/queries/list-commissions.use-case"
import type { CreateCommissionUseCase } from "../../affiliates/use-cases/create-commission.use-case"
import type { ListPayoutsUseCase } from "../../affiliates/queries/list-payouts.use-case"
import type { CreatePayoutUseCase } from "../../affiliates/use-cases/create-payout.use-case"

export function useAffiliatesList(params?: Parameters<ListAffiliatesUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["affiliates", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListAffiliatesUseCase>(DI_TOKENS.ListAffiliates)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useAffiliate(id: string) {
  return useQuery({
    queryKey: ["affiliates", id],
    queryFn: async () => {
      const uc = container.resolve<GetAffiliateUseCase>(DI_TOKENS.GetAffiliate)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateAffiliate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateAffiliateUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateAffiliateUseCase>(DI_TOKENS.CreateAffiliate)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Affiliate created", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useProgramsList(params?: Parameters<ListProgramsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["affiliates", "programs", params],
    queryFn: async () => {
      const uc = container.resolve<ListProgramsUseCase>(DI_TOKENS.ListPrograms)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: ["affiliates", "programs", id],
    queryFn: async () => {
      const uc = container.resolve<GetProgramUseCase>(DI_TOKENS.GetProgram)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateProgramUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateProgramUseCase>(DI_TOKENS.CreateProgram)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Program created", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateProgramUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateProgramUseCase>(DI_TOKENS.UpdateProgram)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Program updated", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteProgramUseCase>(DI_TOKENS.DeleteProgram)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Program deleted", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCommissionsList(params?: Parameters<ListCommissionsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["affiliates", "commissions", params],
    queryFn: async () => {
      const uc = container.resolve<ListCommissionsUseCase>(DI_TOKENS.ListCommissions)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateCommission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateCommissionUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateCommissionUseCase>(DI_TOKENS.CreateCommission)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Commission created", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function usePayoutsList(params?: Parameters<ListPayoutsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["affiliates", "payouts", params],
    queryFn: async () => {
      const uc = container.resolve<ListPayoutsUseCase>(DI_TOKENS.ListPayouts)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreatePayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreatePayoutUseCase['execute']>[0]) => {
      const uc = container.resolve<CreatePayoutUseCase>(DI_TOKENS.CreatePayout)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Payout created", "success"); qc.invalidateQueries({ queryKey: ["affiliates"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
