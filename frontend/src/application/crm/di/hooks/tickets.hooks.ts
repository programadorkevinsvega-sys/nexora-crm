/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

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
