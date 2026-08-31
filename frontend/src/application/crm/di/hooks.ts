"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "./container"
import { DI_TOKENS } from "./tokens"
import { useToastStore } from "@/src/presentation/components/toast"

// Helper to unwrap Result from use cases
function unwrap<T>(result: {
  success: boolean
  value?: T
  data?: T
  error?: unknown
}): T {
  if (!result.success) {
    if (result.error instanceof Error) throw result.error
    throw new Error(typeof result.error === "string" ? result.error : "Operation failed")
  }

  if ("value" in result) return result.value as T
  return result.data as T
}

// === Companies ===
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

// === Contacts ===
export function useContactsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["contacts", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListContacts)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetContact)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateContact)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contact created", "success"); qc.invalidateQueries({ queryKey: ["contacts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateContact)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contact updated", "success"); qc.invalidateQueries({ queryKey: ["contacts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteContact)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contact deleted", "success"); qc.invalidateQueries({ queryKey: ["contacts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Deals ===
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

// === Pipelines ===
export function usePipelinesList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["pipelines", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListPipelines)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function usePipelineBoard(pipelineId: string) {
  return useQuery({
    queryKey: ["pipelines", "board", pipelineId],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetPipelineBoard)
      return unwrap<any>(await uc.execute(pipelineId))
    },
    enabled: !!pipelineId,
  })
}

export function useCreatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreatePipeline)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline created", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdatePipeline)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline updated", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeletePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeletePipeline)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pipeline deleted", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCreateStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ pipelineId, data }: { pipelineId: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateStage)
      return unwrap<any>(await uc.execute(pipelineId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Stage created", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useReorderStages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ pipelineId, stageIds }: { pipelineId: string; stageIds: string[] }) => {
      const uc = container.resolve<any>(DI_TOKENS.ReorderStages)
      return unwrap<void>(await uc.execute(pipelineId, stageIds))
    },
    onSuccess: () => { useToastStore.getState().addToast("Stages reordered", "success"); qc.invalidateQueries({ queryKey: ["pipelines"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Notes ===
export function useNotesList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["notes", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListNotes)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateNote)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note created", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateNote)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note updated", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteNote)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Note deleted", "success"); qc.invalidateQueries({ queryKey: ["notes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Tasks ===
export function useTasksList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["tasks", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListTasks)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateTask)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task created", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateTask)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task updated", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteTask)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Task deleted", "success"); qc.invalidateQueries({ queryKey: ["tasks"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Calls ===
export function useCallsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["calls", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListCalls)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateCall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateCall)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Call logged", "success"); qc.invalidateQueries({ queryKey: ["calls"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Support Tickets ===
export function useTicketsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["tickets", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListTickets)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetTicket)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateTicket)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Ticket created", "success"); qc.invalidateQueries({ queryKey: ["tickets"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateTicket)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Ticket updated", "success"); qc.invalidateQueries({ queryKey: ["tickets"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteTicket)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Ticket deleted", "success"); qc.invalidateQueries({ queryKey: ["tickets"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useTicketRepliesList(ticketId: string) {
  return useQuery({
    queryKey: ["tickets", "replies", ticketId],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListTicketReplies)
      return unwrap<any>(await uc.execute(ticketId))
    },
    enabled: !!ticketId,
  })
}

export function useCreateTicketReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateTicketReply)
      return unwrap<any>(await uc.execute(ticketId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Reply added", "success"); qc.invalidateQueries({ queryKey: ["tickets"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Campaigns ===
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

// === Contracts ===
export function useContractsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["contracts", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListContracts)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetContract)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateContract)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contract created", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateContract)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contract updated", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteContract)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contract deleted", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRenewContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.RenewContract)
      return unwrap<any>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contract renewed", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateContractStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateContractStatus)
      return unwrap<any>(await uc.execute(id, status))
    },
    onSuccess: () => { useToastStore.getState().addToast("Status updated", "success"); qc.invalidateQueries({ queryKey: ["contracts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Quotes ===
export function useQuotesList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["quotes", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListQuotes)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetQuote)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateQuote)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote created", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useAcceptQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.AcceptQuote)
      return unwrap<any>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote accepted", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRejectQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const uc = container.resolve<any>(DI_TOKENS.RejectQuote)
      return unwrap<any>(await uc.execute(id, reason))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote rejected", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteQuote)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote deleted", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useSendQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.SendQuote)
      return unwrap<any>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote sent", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Sales Teams ===
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

// === Helpdesk ===
export function useConversationsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["helpdesk", "conversations", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListConversations)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["helpdesk", "conversations", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetConversation)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateConversation)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation created", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateConversation)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation updated", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useAssignConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, agentId }: { id: string; agentId: string }) => {
      const uc = container.resolve<any>(DI_TOKENS.AssignConversation)
      return unwrap<any>(await uc.execute(id, agentId))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation assigned", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCloseConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.CloseConversation)
      return unwrap<any>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation closed", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useResolveConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.ResolveConversation)
      return unwrap<any>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation resolved", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useMailboxesList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["helpdesk", "mailboxes", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListMailboxes)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateMailbox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateMailbox)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Mailbox created", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useThreadsList(conversationId: string) {
  return useQuery({
    queryKey: ["helpdesk", "threads", conversationId],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListThreads)
      return unwrap<any>(await uc.execute(conversationId))
    },
    enabled: !!conversationId,
  })
}

export function useCreateThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateThread)
      return unwrap<any>(await uc.execute(conversationId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Thread created", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Affiliates ===
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

// === Personal CRM ===
export function useLifeEventsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["personal-crm", "life-events", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListLifeEvents)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateLifeEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateLifeEvent)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Life event created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useGiftsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["personal-crm", "gifts", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListGifts)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateGift)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Gift created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDebtsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["personal-crm", "debts", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListDebts)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateDebt)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Debt created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useSettleDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.SettleDebt)
      return unwrap<any>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Debt settled", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRemindersList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["personal-crm", "reminders", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListReminders)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateReminder)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Reminder created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useToggleReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.ToggleReminder)
      return unwrap<any>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Reminder toggled", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function usePetsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["personal-crm", "pets", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListPets)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreatePet)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pet created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Loyalty ===
export function useLoyaltyProfile(contactId: string) {
  return useQuery({
    queryKey: ["loyalty", "profile", contactId],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetLoyaltyProfile)
      return unwrap<any>(await uc.execute(contactId))
    },
    enabled: !!contactId,
  })
}

export function useEarnPoints() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ contactId, points }: { contactId: string; points: number }) => {
      const uc = container.resolve<any>(DI_TOKENS.EarnPoints)
      return unwrap<any>(await uc.execute(contactId, points))
    },
    onSuccess: () => { useToastStore.getState().addToast("Points earned", "success"); qc.invalidateQueries({ queryKey: ["loyalty"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRedeemPoints() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ contactId, points }: { contactId: string; points: number }) => {
      const uc = container.resolve<any>(DI_TOKENS.RedeemPoints)
      return unwrap<any>(await uc.execute(contactId, points))
    },
    onSuccess: () => { useToastStore.getState().addToast("Points redeemed", "success"); qc.invalidateQueries({ queryKey: ["loyalty"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useSegmentsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["loyalty", "segments", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListSegments)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useCreateSegment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateSegment)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Segment created", "success"); qc.invalidateQueries({ queryKey: ["loyalty"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useAssignToSegment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ segmentId, contactId }: { segmentId: string; contactId: string }) => {
      const uc = container.resolve<any>(DI_TOKENS.AssignToSegment)
      return unwrap<any>(await uc.execute(segmentId, contactId))
    },
    onSuccess: () => { useToastStore.getState().addToast("Assigned to segment", "success"); qc.invalidateQueries({ queryKey: ["loyalty"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Tags ===
export function useTagsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["tags", "list", params],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.ListTags)
      return unwrap<any>(await uc.execute(params))
    },
  })
}

export function useTag(id: string) {
  return useQuery({
    queryKey: ["tags", id],
    queryFn: async () => {
      const uc = container.resolve<any>(DI_TOKENS.GetTag)
      return unwrap<any>(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const uc = container.resolve<any>(DI_TOKENS.CreateTag)
      return unwrap<any>(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Tag created", "success"); qc.invalidateQueries({ queryKey: ["tags"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const uc = container.resolve<any>(DI_TOKENS.UpdateTag)
      return unwrap<any>(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Tag updated", "success"); qc.invalidateQueries({ queryKey: ["tags"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<any>(DI_TOKENS.DeleteTag)
      return unwrap<void>(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Tag deleted", "success"); qc.invalidateQueries({ queryKey: ["tags"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

// === Web Forms & Lead Capture ===
import { ApiWebFormsRepository } from "@/src/infrastructure/crm/repositories/web-forms/api-web-forms.repository"
import type { CreateWebForm, UpdateWebForm } from "@crm/contracts"

export function useWebFormsList() {
  return useQuery({
    queryKey: ["web-forms", "list"],
    queryFn: async () => ApiWebFormsRepository.list(),
  })
}

export function useWebForm(id: string) {
  return useQuery({
    queryKey: ["web-forms", id],
    queryFn: async () => ApiWebFormsRepository.getById(id),
    enabled: !!id,
  })
}

export function useCreateWebForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateWebForm) => ApiWebFormsRepository.create(data),
    onSuccess: () => {
      useToastStore.getState().addToast("Formulario creado exitosamente", "success")
      qc.invalidateQueries({ queryKey: ["web-forms"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al crear", "error"),
  })
}

export function useUpdateWebForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWebForm }) => ApiWebFormsRepository.update(id, data),
    onSuccess: () => {
      useToastStore.getState().addToast("Formulario actualizado exitosamente", "success")
      qc.invalidateQueries({ queryKey: ["web-forms"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al actualizar", "error"),
  })
}

export function useDeleteWebForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => ApiWebFormsRepository.delete(id),
    onSuccess: () => {
      useToastStore.getState().addToast("Formulario eliminado", "success")
      qc.invalidateQueries({ queryKey: ["web-forms"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al eliminar", "error"),
  })
}

export function useWebFormSubmissions(formId: string) {
  return useQuery({
    queryKey: ["web-forms", formId, "submissions"],
    queryFn: async () => ApiWebFormsRepository.getSubmissions(formId),
    enabled: !!formId,
  })
}

export function usePublicWebForm(idOrSlug: string) {
  return useQuery({
    queryKey: ["public-web-forms", idOrSlug],
    queryFn: async () => ApiWebFormsRepository.getPublicForm(idOrSlug),
    enabled: !!idOrSlug,
  })
}

// === Meta Facebook Lead Ads ===
import { ApiMetaLeadsRepository } from "@/src/infrastructure/crm/repositories/meta-leads/api-meta-leads.repository"
import type { MetaConfigUpdate, SimulateMetaLead } from "@crm/contracts"

export function useMetaStatus() {
  return useQuery({
    queryKey: ["meta", "status"],
    queryFn: async () => ApiMetaLeadsRepository.getStatus(),
  })
}

export function useMetaOAuthUrl(redirectUri?: string) {
  return useQuery({
    queryKey: ["meta", "oauth-url", redirectUri],
    queryFn: async () => ApiMetaLeadsRepository.getOAuthUrl(redirectUri),
    enabled: false,
  })
}

export function useMetaCallback() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => ApiMetaLeadsRepository.handleCallback(code),
    onSuccess: () => {
      useToastStore.getState().addToast("¡Meta Business Suite conectado exitosamente!", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al conectar con Meta", "error"),
  })
}

export function useMetaUpdateConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: MetaConfigUpdate) => ApiMetaLeadsRepository.updateConfig(dto),
    onSuccess: () => {
      useToastStore.getState().addToast("Configuración de Meta Ads guardada", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al guardar", "error"),
  })
}

export function useMetaSyncForms() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => ApiMetaLeadsRepository.syncForms(),
    onSuccess: () => {
      useToastStore.getState().addToast("Formularios de Meta sincronizados", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al sincronizar", "error"),
  })
}

export function useMetaDisconnect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => ApiMetaLeadsRepository.disconnect(),
    onSuccess: () => {
      useToastStore.getState().addToast("Meta Business desconectado", "info")
      qc.invalidateQueries({ queryKey: ["meta"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al desconectar", "error"),
  })
}

export function useMetaLogs() {
  return useQuery({
    queryKey: ["meta", "logs"],
    queryFn: async () => ApiMetaLeadsRepository.listLogs(),
    refetchInterval: 10_000,
  })
}

export function useSimulateMetaLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: SimulateMetaLead) => ApiMetaLeadsRepository.simulateLead(dto),
    onSuccess: () => {
      useToastStore.getState().addToast("Lead de Meta recibido y procesado en el CRM", "success")
      qc.invalidateQueries({ queryKey: ["meta"] })
      qc.invalidateQueries({ queryKey: ["contacts"] })
      qc.invalidateQueries({ queryKey: ["deals"] })
    },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Error al simular lead", "error"),
  })
}


