"use client"

import { cn } from "@/src/shared/utils/cn"

const STATUS_STYLES: Record<string, string> = {
  // Success states
  active: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
  completed: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
  won: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
  open: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
  resolved: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
  paid: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
  published: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
  enabled: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
  // Pending/progress states
  pending: "bg-[rgba(2,184,204,0.10)] text-[#02b8cc] border border-[rgba(2,184,204,0.20)]",
  in_progress: "bg-[rgba(2,184,204,0.10)] text-[#02b8cc] border border-[rgba(2,184,204,0.20)]",
  partial: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04] border border-[rgba(234,179,8,0.25)]",
  scheduled: "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6] border border-[rgba(139,92,246,0.25)]",
  // Cancelled/error states
  cancelled: "bg-[rgba(235,87,87,0.10)] text-[#eb5757] border border-[rgba(235,87,87,0.20)]",
  lost: "bg-[rgba(235,87,87,0.10)] text-[#eb5757] border border-[rgba(235,87,87,0.20)]",
  closed: "bg-[rgba(235,87,87,0.10)] text-[#eb5757] border border-[rgba(235,87,87,0.20)]",
  failed: "bg-[rgba(235,87,87,0.10)] text-[#eb5757] border border-[rgba(235,87,87,0.20)]",
  expired: "bg-[rgba(235,87,87,0.10)] text-[#eb5757] border border-[rgba(235,87,87,0.20)]",
  // Neutral states
  draft: "bg-[rgba(255,255,255,0.04)] text-[#8a8f98] border border-[#23252a]",
  archived: "bg-[rgba(255,255,255,0.04)] text-[#8a8f98] border border-[#23252a]",
  disabled: "bg-[rgba(255,255,255,0.04)] text-[#8a8f98] border border-[#23252a]",
}

export interface StatusBadgeProps {
  status?: string | null
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = typeof status === "string" ? status.trim() : ""
  const key = normalized.toLowerCase()
  const style = STATUS_STYLES[key] ?? "bg-[rgba(255,255,255,0.05)] text-[#8a8f98]"
  const label = normalized ? normalized.replace(/_/g, " ") : "Desconocido"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] px-1.5 py-0 text-[12px] font-[400] leading-[18px] select-none",
        style,
        className,
      )}
    >
      {label}
    </span>
  )
}

// Keep legacy export for backward compat
export const VARIANT_MAP: Record<string, string> = {}

export { StatusBadge }
