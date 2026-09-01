/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"

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
