"use client"

import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/shared/utils/cn"

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-white/[0.06] text-slate-300 border border-white/[0.08]",
        success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20",
        info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
        secondary: "bg-slate-800/80 text-slate-400 border border-slate-700/50",
        outline: "border border-white/[0.14] text-slate-200 bg-transparent",
        destructive: "bg-red-500/15 text-red-400 border border-red-500/30",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs",
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
  const dotColor = {
    default: "bg-slate-400",
    success: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    warning: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    danger: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]",
    info: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]",
    purple: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]",
    cyan: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
    secondary: "bg-slate-500",
    outline: "bg-slate-300",
    destructive: "bg-red-400",
  }[variant || "default"]

  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className={cn("size-1.5 rounded-full shrink-0", dotColor)} />}
      {children}
    </span>
  )
}

export { Badge }
