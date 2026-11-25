"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListCompaniesUseCase } from "../../companies/queries/list-companies.use-case"
import type { GetCompanyUseCase } from "../../companies/queries/get-company.use-case"
import type { CreateCompanyUseCase } from "../../companies/use-cases/create-company.use-case"
import type { UpdateCompanyUseCase } from "../../companies/use-cases/update-company.use-case"
import type { DeleteCompanyUseCase } from "../../companies/use-cases/delete-company.use-case"

export function useCompaniesList(params?: Parameters<ListCompaniesUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["companies", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListCompaniesUseCase>(DI_TOKENS.ListCompanies)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: async () => {
      const uc = container.resolve<GetCompanyUseCase>(DI_TOKENS.GetCompany)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateCompanyUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateCompanyUseCase>(DI_TOKENS.CreateCompany)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Company created", "success"); qc.invalidateQueries({ queryKey: ["companies"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateCompanyUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateCompanyUseCase>(DI_TOKENS.UpdateCompany)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Company updated", "success"); qc.invalidateQueries({ queryKey: ["companies"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteCompanyUseCase>(DI_TOKENS.DeleteCompany)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Company deleted", "success"); qc.invalidateQueries({ queryKey: ["companies"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
