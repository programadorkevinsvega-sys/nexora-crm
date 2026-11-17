"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { RefreshCw } from "lucide-react"
import { ApiContractRepository } from "@/src/infrastructure/crm/repositories/contracts/api-contract.repository"

export interface RenewContractActionProps {
  contractId: string
  status: string
}

export function RenewContractAction({ contractId, status }: RenewContractActionProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => ApiContractRepository.renew(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract", contractId] })
      queryClient.invalidateQueries({ queryKey: ["contracts"] })
    },
  })

  if (status !== "ACTIVE" && status !== "EXPIRED") return null

  return (
    <Button variant="ghost" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
      <RefreshCw className="h-4 w-4" />
      {mutation.isPending ? "Renewing..." : "Renew"}
    </Button>
  )
}
