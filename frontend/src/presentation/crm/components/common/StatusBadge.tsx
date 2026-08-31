"use client"

import { Badge, type BadgeProps } from "@/src/presentation/crm/components/ui/Badge"

const VARIANT_MAP: Record<string, BadgeProps["variant"]> = {
  active: "success",
  completed: "success",
  won: "success",
  open: "success",
  resolved: "success",
  paid: "success",
  published: "success",
  enabled: "success",

  pending: "warning",
  in_progress: "info",
  partial: "warning",
  draft: "default",
  scheduled: "info",

  cancelled: "danger",
  lost: "danger",
  closed: "danger",
  failed: "danger",
  archived: "danger",
  disabled: "danger",
  expired: "danger",
}

export interface StatusBadgeProps {
  status?: string | null
  variant?: BadgeProps["variant"]
  className?: string
}

function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const normalizedStatus = typeof status === "string" ? status.trim() : ""
  const statusKey = normalizedStatus.toLowerCase()
  const resolvedVariant = variant || VARIANT_MAP[statusKey] || "default"
  const label = normalizedStatus ? normalizedStatus.replace(/_/g, " ") : "Unknown"

  return (
    <Badge variant={resolvedVariant} className={className}>
      {label}
    </Badge>
  )
}

export { StatusBadge, VARIANT_MAP }
