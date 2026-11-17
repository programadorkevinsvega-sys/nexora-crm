/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

export function useSalesTeamsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["sales-teams", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListSalesTeams)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useSalesTeam(id: string) {
  return useQuery({
    queryKey: ["sales-teams", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetSalesTeam)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateSalesTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateSalesTeam)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Team created", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateSalesTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateSalesTeam)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Team updated", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteSalesTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteSalesTeam)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Team deleted", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useTeamMembersList(teamId: string) {
  return useQuery({
    queryKey: ["sales-teams", "members", teamId],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListTeamMembers)
      return unwrap<any>(await uc.execute(teamId))
    },
    enabled: !!teamId,
  })
}

export function useAddTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.AddTeamMember)
      return unwrap<any>(await uc.execute(teamId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Member added", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRemoveTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const uc = container.resolve<any>(DI_TOKENS.RemoveTeamMember)
      return unwrap<void>(await uc.execute(teamId, userId))
    },
    onSuccess: () => { useToastStore.getState().addToast("Member removed", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useTeamQuotasList(teamId: string) {
  return useQuery({
    queryKey: ["sales-teams", "quotas", teamId],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListTeamQuotas)
      return unwrap<any>(await uc.execute(teamId))
    },
    enabled: !!teamId,
  })
}

export function useCreateTeamQuota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateTeamQuota)
      return unwrap<any>(await uc.execute(teamId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quota created", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
