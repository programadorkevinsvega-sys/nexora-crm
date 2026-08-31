"use client"

import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/shared/utils/cn"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-iron text-ash",
        success: "bg-[#0f2a17] text-[#4ade80]",
        warning: "bg-[#2a220f] text-[#fbbf24]",
        danger: "bg-[#2a1010] text-[#f87171]",
        info: "bg-[#0a1f3d] text-[#5ea0ff]",
        secondary: "bg-muted text-muted-foreground",
        outline: "border border-border text-foreground bg-transparent",
        destructive: "bg-[#2a1010] text-[#f87171]",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
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
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge }
