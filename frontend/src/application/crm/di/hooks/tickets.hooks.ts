"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListTicketsUseCase } from "../../support-tickets/queries/list-tickets.use-case"
import type { GetTicketUseCase } from "../../support-tickets/queries/get-ticket.use-case"
import type { CreateTicketUseCase } from "../../support-tickets/use-cases/create-ticket.use-case"
import type { UpdateTicketUseCase } from "../../support-tickets/use-cases/update-ticket.use-case"
import type { DeleteTicketUseCase } from "../../support-tickets/use-cases/delete-ticket.use-case"
import type { ListTicketRepliesUseCase } from "../../support-tickets/queries/list-ticket-replies.use-case"
import type { CreateTicketReplyUseCase } from "../../support-tickets/use-cases/create-ticket-reply.use-case"

export function useTicketsList(params?: Parameters<ListTicketsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["tickets", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListTicketsUseCase>(DI_TOKENS.ListTickets)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: async () => {
      const uc = container.resolve<GetTicketUseCase>(DI_TOKENS.GetTicket)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateTicketUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateTicketUseCase>(DI_TOKENS.CreateTicket)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Ticket created", "success"); qc.invalidateQueries({ queryKey: ["tickets"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateTicketUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateTicketUseCase>(DI_TOKENS.UpdateTicket)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Ticket updated", "success"); qc.invalidateQueries({ queryKey: ["tickets"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteTicketUseCase>(DI_TOKENS.DeleteTicket)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Ticket deleted", "success"); qc.invalidateQueries({ queryKey: ["tickets"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useTicketRepliesList(ticketId: string) {
  return useQuery({
    queryKey: ["tickets", "replies", ticketId],
    queryFn: async () => {
      const uc = container.resolve<ListTicketRepliesUseCase>(DI_TOKENS.ListTicketReplies)
      return unwrap(await uc.execute(ticketId))
    },
    enabled: !!ticketId,
  })
}

export function useCreateTicketReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: string; data: Parameters<CreateTicketReplyUseCase['execute']>[1] }) => {
      const uc = container.resolve<CreateTicketReplyUseCase>(DI_TOKENS.CreateTicketReply)
      return unwrap(await uc.execute(ticketId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Reply added", "success"); qc.invalidateQueries({ queryKey: ["tickets"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
