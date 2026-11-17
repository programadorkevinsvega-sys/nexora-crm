/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

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
