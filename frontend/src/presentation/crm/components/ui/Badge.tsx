"use client"

import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/shared/utils/cn"

export const badgeVariants = cva(
  "inline-flex items-center gap-1 font-[400] tracking-[0.01em] transition-colors select-none rounded-[4px]",
  {
    variants: {
      variant: {
        default: "bg-[rgba(255,255,255,0.05)] text-[#8a8f98]",
        lime: "bg-[rgba(228,242,34,0.12)] text-[#e4f222] border border-[rgba(228,242,34,0.25)]",
        success: "bg-[rgba(39,166,68,0.12)] text-[#27a644] border border-[rgba(39,166,68,0.25)]",
        warning: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04] border border-[rgba(234,179,8,0.25)]",
        danger: "bg-[rgba(235,87,87,0.10)] text-[#eb5757] border border-[rgba(235,87,87,0.20)]",
        info: "bg-[rgba(2,184,204,0.10)] text-[#02b8cc] border border-[rgba(2,184,204,0.20)]",
        violet: "bg-[rgba(99,102,241,0.12)] text-[#6366f1] border border-[rgba(99,102,241,0.25)]",
        lavender: "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6] border border-[rgba(139,92,246,0.25)]",
        teal: "bg-[rgba(2,184,204,0.10)] text-[#02b8cc] border border-[rgba(2,184,204,0.20)]",
        secondary: "bg-[rgba(255,255,255,0.04)] text-[#8a8f98] border border-[#23252a]",
        outline: "border border-[#23252a] text-[#d0d6e0] bg-transparent",
        destructive: "bg-[rgba(235,87,87,0.10)] text-[#eb5757] border border-[rgba(235,87,87,0.20)]",
        purple: "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6] border border-[rgba(139,92,246,0.25)]",
        cyan: "bg-[rgba(2,184,204,0.10)] text-[#02b8cc] border border-[rgba(2,184,204,0.20)]",
      },
      size: {
        sm: "px-1.5 py-0 text-[11px] leading-[18px]",
        md: "px-1.5 py-0 text-[12px] leading-[18px]",
        lg: "px-2 py-0.5 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full shrink-0 bg-current opacity-70" />}
      {children}
    </span>
  )
}

export { Badge }
