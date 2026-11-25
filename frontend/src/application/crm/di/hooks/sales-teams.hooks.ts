"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListSalesTeamsUseCase } from "../../sales-teams/queries/list-sales-teams.use-case"
import type { GetSalesTeamUseCase } from "../../sales-teams/queries/get-sales-team.use-case"
import type { CreateSalesTeamUseCase } from "../../sales-teams/use-cases/create-sales-team.use-case"
import type { UpdateSalesTeamUseCase } from "../../sales-teams/use-cases/update-sales-team.use-case"
import type { DeleteSalesTeamUseCase } from "../../sales-teams/use-cases/delete-sales-team.use-case"
import type { ListTeamMembersUseCase } from "../../sales-teams/queries/list-team-members.use-case"
import type { AddTeamMemberUseCase } from "../../sales-teams/use-cases/add-team-member.use-case"
import type { RemoveTeamMemberUseCase } from "../../sales-teams/use-cases/remove-team-member.use-case"
import type { ListTeamQuotasUseCase } from "../../sales-teams/queries/list-team-quotas.use-case"
import type { CreateTeamQuotaUseCase } from "../../sales-teams/use-cases/create-team-quota.use-case"

export function useSalesTeamsList(params?: Parameters<ListSalesTeamsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["sales-teams", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListSalesTeamsUseCase>(DI_TOKENS.ListSalesTeams)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useSalesTeam(id: string) {
  return useQuery({
    queryKey: ["sales-teams", id],
    queryFn: async () => {
      const uc = container.resolve<GetSalesTeamUseCase>(DI_TOKENS.GetSalesTeam)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateSalesTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateSalesTeamUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateSalesTeamUseCase>(DI_TOKENS.CreateSalesTeam)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Team created", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateSalesTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateSalesTeamUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateSalesTeamUseCase>(DI_TOKENS.UpdateSalesTeam)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Team updated", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteSalesTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteSalesTeamUseCase>(DI_TOKENS.DeleteSalesTeam)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Team deleted", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useTeamMembersList(teamId: string) {
  return useQuery({
    queryKey: ["sales-teams", "members", teamId],
    queryFn: async () => {
      const uc = container.resolve<ListTeamMembersUseCase>(DI_TOKENS.ListTeamMembers)
      return unwrap(await uc.execute(teamId))
    },
    enabled: !!teamId,
  })
}

export function useAddTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: Parameters<AddTeamMemberUseCase['execute']>[1] }) => {
      const uc = container.resolve<AddTeamMemberUseCase>(DI_TOKENS.AddTeamMember)
      return unwrap(await uc.execute(teamId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Member added", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRemoveTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: Parameters<RemoveTeamMemberUseCase['execute']>[1] }) => {
      const uc = container.resolve<RemoveTeamMemberUseCase>(DI_TOKENS.RemoveTeamMember)
      return unwrap(await uc.execute(teamId, userId))
    },
    onSuccess: () => { useToastStore.getState().addToast("Member removed", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useTeamQuotasList(teamId: string) {
  return useQuery({
    queryKey: ["sales-teams", "quotas", teamId],
    queryFn: async () => {
      const uc = container.resolve<ListTeamQuotasUseCase>(DI_TOKENS.ListTeamQuotas)
      return unwrap(await uc.execute(teamId))
    },
    enabled: !!teamId,
  })
}

export function useCreateTeamQuota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: unknown }) => {
      const uc = container.resolve<CreateTeamQuotaUseCase>(DI_TOKENS.CreateTeamQuota)
      return unwrap(await uc.execute(teamId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quota created", "success"); qc.invalidateQueries({ queryKey: ["sales-teams"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
