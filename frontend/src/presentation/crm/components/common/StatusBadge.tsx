"use client"

import { cn } from "@/src/shared/utils/cn"

const STATUS_STYLES: Record<string, string> = {
  // Success states
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25",
  won: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25",
  open: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25",
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25",
  enabled: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25",
  // Pending/progress states
  pending: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20",
  in_progress: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20",
  partial: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25",
  scheduled: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/25",
  // Cancelled/error states
  cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
  lost: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
  closed: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
  failed: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
  expired: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
  // Neutral states
  draft: "bg-muted text-muted-foreground border border-border",
  archived: "bg-muted text-muted-foreground border border-border",
  disabled: "bg-muted text-muted-foreground border border-border",
}

export interface StatusBadgeProps {
  status?: string | null
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = typeof status === "string" ? status.trim() : ""
  const key = normalized.toLowerCase()
  const style = STATUS_STYLES[key] ?? "bg-muted text-muted-foreground border border-border"
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
