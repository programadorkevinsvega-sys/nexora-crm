/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

export function useCampaignsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["campaigns", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListCampaigns)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetCampaign)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateCampaign)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Campaign created", "success"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateCampaign)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Campaign updated", "success"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteCampaign)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Campaign deleted", "success"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCampaignMembersList(campaignId: string) {
  return useQuery({
    queryKey: ["campaigns", "members", campaignId],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListCampaignMembers)
      return unwrap<any>(await uc.execute(campaignId))
    },
    enabled: !!campaignId,
  })
}

export function useAddCampaignMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.AddCampaignMember)
      return unwrap<any>(await uc.execute(campaignId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Member added", "success"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
