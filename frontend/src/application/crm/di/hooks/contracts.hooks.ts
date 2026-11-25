"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListContractsUseCase } from "../../contracts/queries/list-contracts.use-case"
import type { GetContractUseCase } from "../../contracts/queries/get-contract.use-case"
import type { CreateContractUseCase } from "../../contracts/use-cases/create-contract.use-case"
import type { UpdateContractUseCase } from "../../contracts/use-cases/update-contract.use-case"
import type { DeleteContractUseCase } from "../../contracts/use-cases/delete-contract.use-case"
import type { RenewContractUseCase } from "../../contracts/use-cases/renew-contract.use-case"
import type { UpdateContractStatusUseCase } from "../../contracts/use-cases/update-contract-status.use-case"

export function useContractsList(params?: Parameters<ListContractsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["contracts", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListContractsUseCase>(DI_TOKENS.ListContracts)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const uc = container.resolve<GetContractUseCase>(DI_TOKENS.GetContract)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateContractUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateContractUseCase>(DI_TOKENS.CreateContract)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contract created", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateContractUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateContractUseCase>(DI_TOKENS.UpdateContract)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contract updated", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteContractUseCase>(DI_TOKENS.DeleteContract)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contract deleted", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRenewContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<RenewContractUseCase>(DI_TOKENS.RenewContract)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contract renewed", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateContractStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Parameters<UpdateContractStatusUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateContractStatusUseCase>(DI_TOKENS.UpdateContractStatus)
      return unwrap(await uc.execute(id, status))
    },
    onSuccess: () => { useToastStore.getState().addToast("Status updated", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
