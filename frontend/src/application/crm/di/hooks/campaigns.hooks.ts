"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListCampaignsUseCase } from "../../campaigns/queries/list-campaigns.use-case"
import type { GetCampaignUseCase } from "../../campaigns/queries/get-campaign.use-case"
import type { CreateCampaignUseCase } from "../../campaigns/use-cases/create-campaign.use-case"
import type { UpdateCampaignUseCase } from "../../campaigns/use-cases/update-campaign.use-case"
import type { DeleteCampaignUseCase } from "../../campaigns/use-cases/delete-campaign.use-case"
import type { ListCampaignMembersUseCase } from "../../campaigns/queries/list-campaign-members.use-case"
import type { AddCampaignMemberUseCase } from "../../campaigns/use-cases/add-campaign-member.use-case"

export function useCampaignsList(params?: Parameters<ListCampaignsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["campaigns", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListCampaignsUseCase>(DI_TOKENS.ListCampaigns)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const uc = container.resolve<GetCampaignUseCase>(DI_TOKENS.GetCampaign)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateCampaignUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateCampaignUseCase>(DI_TOKENS.CreateCampaign)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Campaign created", "success"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateCampaignUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateCampaignUseCase>(DI_TOKENS.UpdateCampaign)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Campaign updated", "success"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteCampaignUseCase>(DI_TOKENS.DeleteCampaign)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Campaign deleted", "success"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCampaignMembersList(campaignId: string) {
  return useQuery({
    queryKey: ["campaigns", "members", campaignId],
    queryFn: async () => {
      const uc = container.resolve<ListCampaignMembersUseCase>(DI_TOKENS.ListCampaignMembers)
      return unwrap(await uc.execute(campaignId))
    },
    enabled: !!campaignId,
  })
}

export function useAddCampaignMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: Parameters<AddCampaignMemberUseCase['execute']>[1] }) => {
      const uc = container.resolve<AddCampaignMemberUseCase>(DI_TOKENS.AddCampaignMember)
      return unwrap(await uc.execute(campaignId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Member added", "success"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
