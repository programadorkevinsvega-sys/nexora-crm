"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListQuotesUseCase } from "../../quotes/queries/list-quotes.use-case"
import type { GetQuoteUseCase } from "../../quotes/queries/get-quote.use-case"
import type { CreateQuoteUseCase } from "../../quotes/use-cases/create-quote.use-case"
import type { AcceptQuoteUseCase } from "../../quotes/use-cases/accept-quote.use-case"
import type { RejectQuoteUseCase } from "../../quotes/use-cases/reject-quote.use-case"
import type { DeleteQuoteUseCase } from "../../quotes/use-cases/delete-quote.use-case"
import type { SendQuoteUseCase } from "../../quotes/use-cases/send-quote.use-case"

export function useQuotesList(params?: Parameters<ListQuotesUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["quotes", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListQuotesUseCase>(DI_TOKENS.ListQuotes)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: async () => {
      const uc = container.resolve<GetQuoteUseCase>(DI_TOKENS.GetQuote)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateQuoteUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateQuoteUseCase>(DI_TOKENS.CreateQuote)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote created", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useAcceptQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<AcceptQuoteUseCase>(DI_TOKENS.AcceptQuote)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote accepted", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRejectQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: Parameters<RejectQuoteUseCase['execute']>[1] }) => {
      const uc = container.resolve<RejectQuoteUseCase>(DI_TOKENS.RejectQuote)
      return unwrap(await uc.execute(id, reason))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote rejected", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteQuoteUseCase>(DI_TOKENS.DeleteQuote)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote deleted", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useSendQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<SendQuoteUseCase>(DI_TOKENS.SendQuote)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Quote sent", "success"); qc.invalidateQueries({ queryKey: ["quotes"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
