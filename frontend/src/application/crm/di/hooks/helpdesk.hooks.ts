"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListConversationsUseCase } from "../../helpdesk/queries/list-conversations.use-case"
import type { GetConversationUseCase } from "../../helpdesk/queries/get-conversation.use-case"
import type { CreateConversationUseCase } from "../../helpdesk/use-cases/create-conversation.use-case"
import type { UpdateConversationUseCase } from "../../helpdesk/use-cases/update-conversation.use-case"
import type { AssignConversationUseCase } from "../../helpdesk/use-cases/assign-conversation.use-case"
import type { CloseConversationUseCase } from "../../helpdesk/use-cases/close-conversation.use-case"
import type { ResolveConversationUseCase } from "../../helpdesk/use-cases/resolve-conversation.use-case"
import type { ListMailboxesUseCase } from "../../helpdesk/queries/list-mailboxes.use-case"
import type { CreateMailboxUseCase } from "../../helpdesk/use-cases/create-mailbox.use-case"
import type { ListThreadsUseCase } from "../../helpdesk/queries/list-threads.use-case"
import type { CreateThreadUseCase } from "../../helpdesk/use-cases/create-thread.use-case"

export function useConversationsList(params?: Parameters<ListConversationsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["helpdesk", "conversations", params],
    queryFn: async () => {
      const uc = container.resolve<ListConversationsUseCase>(DI_TOKENS.ListConversations)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["helpdesk", "conversations", id],
    queryFn: async () => {
      const uc = container.resolve<GetConversationUseCase>(DI_TOKENS.GetConversation)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateConversationUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateConversationUseCase>(DI_TOKENS.CreateConversation)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation created", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateConversationUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateConversationUseCase>(DI_TOKENS.UpdateConversation)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation updated", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useAssignConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, agentId }: { id: string; agentId: Parameters<AssignConversationUseCase['execute']>[1] }) => {
      const uc = container.resolve<AssignConversationUseCase>(DI_TOKENS.AssignConversation)
      return unwrap(await uc.execute(id, agentId))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation assigned", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useCloseConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<CloseConversationUseCase>(DI_TOKENS.CloseConversation)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation closed", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useResolveConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<ResolveConversationUseCase>(DI_TOKENS.ResolveConversation)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Conversation resolved", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useMailboxesList(params?: Parameters<ListMailboxesUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["helpdesk", "mailboxes", params],
    queryFn: async () => {
      const uc = container.resolve<ListMailboxesUseCase>(DI_TOKENS.ListMailboxes)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateMailbox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateMailboxUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateMailboxUseCase>(DI_TOKENS.CreateMailbox)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Mailbox created", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useThreadsList(conversationId: string) {
  return useQuery({
    queryKey: ["helpdesk", "threads", conversationId],
    queryFn: async () => {
      const uc = container.resolve<ListThreadsUseCase>(DI_TOKENS.ListThreads)
      return unwrap(await uc.execute(conversationId))
    },
    enabled: !!conversationId,
  })
}

export function useCreateThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: string; data: Parameters<CreateThreadUseCase['execute']>[1] }) => {
      const uc = container.resolve<CreateThreadUseCase>(DI_TOKENS.CreateThread)
      return unwrap(await uc.execute(conversationId, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Thread created", "success"); qc.invalidateQueries({ queryKey: ["helpdesk"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
