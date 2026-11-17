/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

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
