"use client"

import { type ReactNode } from "react"
import { cn } from "@/src/shared/utils/cn"
import { Loader2 } from "lucide-react"

export interface LoadingOverlayProps {
  loading: boolean
  children: ReactNode
  className?: string
}

function LoadingOverlay({ loading, children, className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-carbon/60 backdrop-blur-[1px]">
          <Loader2 className="h-8 w-8 animate-spin text-signal-blue" />
        </div>
      )}
    </div>
  )
}

export { LoadingOverlay }
