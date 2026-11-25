"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { ListLifeEventsUseCase } from "../../personal-crm/queries/list-life-events.use-case"
import type { CreateLifeEventUseCase } from "../../personal-crm/use-cases/create-life-event.use-case"
import type { ListGiftsUseCase } from "../../personal-crm/queries/list-gifts.use-case"
import type { CreateGiftUseCase } from "../../personal-crm/use-cases/create-gift.use-case"
import type { ListDebtsUseCase } from "../../personal-crm/queries/list-debts.use-case"
import type { CreateDebtUseCase } from "../../personal-crm/use-cases/create-debt.use-case"
import type { SettleDebtUseCase } from "../../personal-crm/use-cases/settle-debt.use-case"
import type { ListRemindersUseCase } from "../../personal-crm/queries/list-reminders.use-case"
import type { CreateReminderUseCase } from "../../personal-crm/use-cases/create-reminder.use-case"
import type { ToggleReminderUseCase } from "../../personal-crm/use-cases/toggle-reminder.use-case"
import type { ListPetsUseCase } from "../../personal-crm/queries/list-pets.use-case"
import type { CreatePetUseCase } from "../../personal-crm/use-cases/create-pet.use-case"

export function useLifeEventsList(params?: Parameters<ListLifeEventsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["personal-crm", "life-events", params],
    queryFn: async () => {
      const uc = container.resolve<ListLifeEventsUseCase>(DI_TOKENS.ListLifeEvents)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateLifeEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateLifeEventUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateLifeEventUseCase>(DI_TOKENS.CreateLifeEvent)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Life event created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useGiftsList(params?: Parameters<ListGiftsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["personal-crm", "gifts", params],
    queryFn: async () => {
      const uc = container.resolve<ListGiftsUseCase>(DI_TOKENS.ListGifts)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateGiftUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateGiftUseCase>(DI_TOKENS.CreateGift)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Gift created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useDebtsList(params?: Parameters<ListDebtsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["personal-crm", "debts", params],
    queryFn: async () => {
      const uc = container.resolve<ListDebtsUseCase>(DI_TOKENS.ListDebts)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateDebtUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateDebtUseCase>(DI_TOKENS.CreateDebt)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Debt created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useSettleDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<SettleDebtUseCase>(DI_TOKENS.SettleDebt)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Debt settled", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRemindersList(params?: Parameters<ListRemindersUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["personal-crm", "reminders", params],
    queryFn: async () => {
      const uc = container.resolve<ListRemindersUseCase>(DI_TOKENS.ListReminders)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateReminderUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateReminderUseCase>(DI_TOKENS.CreateReminder)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Reminder created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useToggleReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const uc = container.resolve<ToggleReminderUseCase>(DI_TOKENS.ToggleReminder)
      return unwrap(await uc.execute(id))
    },
    onSuccess: () => { useToastStore.getState().addToast("Reminder toggled", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function usePetsList(params?: Parameters<ListPetsUseCase['execute']>[0]) {
  return useQuery({
    queryKey: ["personal-crm", "pets", params],
    queryFn: async () => {
      const uc = container.resolve<ListPetsUseCase>(DI_TOKENS.ListPets)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreatePetUseCase['execute']>[0]) => {
      const uc = container.resolve<CreatePetUseCase>(DI_TOKENS.CreatePet)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Pet created", "success"); qc.invalidateQueries({ queryKey: ["personal-crm"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
