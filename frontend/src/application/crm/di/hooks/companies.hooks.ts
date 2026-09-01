/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

export function useCompaniesList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["companies", "list", params],
    queryFn: async () => {
      const uc = container.resolve<{ execute: (p?: unknown) => Promise<unknown> }>(DI_TOKENS.ListCompanies)
      return unwrap<any>(await uc.execute(params) as any)
    },
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: async () => {
      const uc = container.resolve<{ execute: (id: string) => Promise<unknown> }>(DI_TOKENS.GetCompany)
      return unwrap<any>(await uc.execute(id) as any)
    },
    enabled: !!id,
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<{ execute: (d: unknown) => Promise<unknown> }>(DI_TOKENS.CreateCompany)
      return unwrap<any>(await uc.execute(data) as any)
    },
    onSuccess: () => { useToastStore.getState().addToast("Company created", "success"); qc.invalidateQueries({ queryKey: ["companies"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<{ execute: (id: string, d: unknown) => Promise<unknown> }>(DI_TOKENS.UpdateCompany)
      return unwrap<any>(await uc.execute(id, data) as any)
    },
    onSuccess: () => { useToastStore.getState().addToast("Company updated", "success"); qc.invalidateQueries({ queryKey: ["companies"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<{ execute: (id: string) => Promise<unknown> }>(DI_TOKENS.DeleteCompany)
      return unwrap<void>(await uc.execute(id) as any)
    },
    onSuccess: () => { useToastStore.getState().addToast("Company deleted", "success"); qc.invalidateQueries({ queryKey: ["companies"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
