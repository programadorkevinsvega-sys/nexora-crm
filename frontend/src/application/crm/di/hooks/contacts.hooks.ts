"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListContactsUseCase } from "../../contacts/queries/list-contacts.use-case"
import type { GetContactUseCase } from "../../contacts/queries/get-contact.use-case"
import type { CreateContactUseCase } from "../../contacts/use-cases/create-contact.use-case"
import type { UpdateContactUseCase } from "../../contacts/use-cases/update-contact.use-case"
import type { DeleteContactUseCase } from "../../contacts/use-cases/delete-contact.use-case"

export function useContactsList(params?: Parameters<ListContactsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["contacts", "list", params],
    queryFn: async () => {
      const uc = container.resolve<ListContactsUseCase>(DI_TOKENS.ListContacts)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const uc = container.resolve<GetContactUseCase>(DI_TOKENS.GetContact)
      return unwrap(await uc.execute(id))
    },
    enabled: !!id,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateContactUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateContactUseCase>(DI_TOKENS.CreateContact)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contact created", "success"); qc.invalidateQueries({ queryKey: ["contacts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<UpdateContactUseCase['execute']>[1] }) => {
      const uc = container.resolve<UpdateContactUseCase>(DI_TOKENS.UpdateContact)
      return unwrap(await uc.execute(id, data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contact updated", "success"); qc.invalidateQueries({ queryKey: ["contacts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<DeleteContactUseCase>(DI_TOKENS.DeleteContact)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Contact deleted", "success"); qc.invalidateQueries({ queryKey: ["contacts"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
