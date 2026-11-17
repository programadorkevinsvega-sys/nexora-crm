"use client"

import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/shared/utils/cn"

export const badgeVariants = cva(
  "inline-flex items-center gap-1 font-[400] tracking-[0.01em] transition-colors select-none rounded-[4px]",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground border border-border",
        lime: "bg-amber-500/10 text-amber-600 dark:text-[#e4f222] border border-amber-500/25",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25",
        danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        info: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
        violet: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25",
        lavender: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25",
        teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
        secondary: "bg-secondary text-secondary-foreground border border-border",
        outline: "border border-border text-foreground bg-transparent",
        destructive: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25",
        cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
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
