"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { container } from "../container"
import { DI_TOKENS } from "../tokens"
import { useToastStore } from "@/src/presentation/components/toast"
import { unwrap } from "./unwrap"
import type { GetProfileUseCase } from "../../loyalty/queries/get-profile.use-case"
import type { EarnPointsUseCase } from "../../loyalty/use-cases/earn-points.use-case"
import type { RedeemPointsUseCase } from "../../loyalty/use-cases/redeem-points.use-case"
import type { ListSegmentsUseCase } from "../../loyalty/queries/list-segments.use-case"
import type { CreateSegmentUseCase } from "../../loyalty/use-cases/create-segment.use-case"
import type { AssignToSegmentUseCase } from "../../loyalty/use-cases/assign-to-segment.use-case"

export function useLoyaltyProfile(contactId: string) {
  return useQuery({
    queryKey: ["loyalty", "profile", contactId],
    queryFn: async () => {
      const uc = container.resolve<GetProfileUseCase>(DI_TOKENS.GetLoyaltyProfile)
      return unwrap(await uc.execute(contactId))
    },
    enabled: !!contactId,
  })
}

export function useEarnPoints() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ contactId, points }: { contactId: string; points: number }) => {
      const uc = container.resolve<EarnPointsUseCase>(DI_TOKENS.EarnPoints)
      return unwrap(await uc.execute(contactId, points))
    },
    onSuccess: () => { useToastStore.getState().addToast("Points earned", "success"); qc.invalidateQueries({ queryKey: ["loyalty"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useRedeemPoints() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ contactId, points }: { contactId: string; points: number }) => {
      const uc = container.resolve<RedeemPointsUseCase>(DI_TOKENS.RedeemPoints)
      return unwrap(await uc.execute(contactId, points))
    },
    onSuccess: () => { useToastStore.getState().addToast("Points redeemed", "success"); qc.invalidateQueries({ queryKey: ["loyalty"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useSegmentsList(params?: Parameters<ListSegmentsUseCase['execute']>[0] {
  return useQuery({
    queryKey: ["loyalty", "segments", params],
    queryFn: async () => {
      const uc = container.resolve<ListSegmentsUseCase>(DI_TOKENS.ListSegments)
      return unwrap(await uc.execute(params))
    },
  })
}

export function useCreateSegment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<CreateSegmentUseCase['execute']>[0]) => {
      const uc = container.resolve<CreateSegmentUseCase>(DI_TOKENS.CreateSegment)
      return unwrap(await uc.execute(data))
    },
    onSuccess: () => { useToastStore.getState().addToast("Segment created", "success"); qc.invalidateQueries({ queryKey: ["loyalty"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}

export function useAssignToSegment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ segmentId, contactId }: { segmentId: string; contactId: string }) => {
      const uc = container.resolve<AssignToSegmentUseCase>(DI_TOKENS.AssignToSegment)
      return unwrap(await uc.execute(segmentId, contactId))
    },
    onSuccess: () => { useToastStore.getState().addToast("Assigned to segment", "success"); qc.invalidateQueries({ queryKey: ["loyalty"] }) },
    onError: (e: unknown) => useToastStore.getState().addToast(e instanceof Error ? e.message : "Failed", "error"),
  })
}
