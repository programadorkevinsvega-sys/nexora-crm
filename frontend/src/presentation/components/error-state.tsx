"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a1010] text-[#f87171] mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-body font-sans font-semibold text-paper mb-1">{title}</h3>
      {message && <p className="text-caption text-ash max-w-md mb-4">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )
}
