"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/shared/utils/cn"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-semibold tracking-wide transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-lg cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 border border-blue-400/30 hover:shadow-blue-500/40",
        secondary:
          "bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] hover:border-white/[0.15] shadow-sm",
        ghost:
          "bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.05]",
        danger:
          "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30",
        outline:
          "border border-white/[0.12] bg-transparent text-slate-200 hover:bg-white/[0.06] hover:border-white/[0.2]",
        success:
          "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 border border-emerald-400/30",
        glass:
          "bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08] text-slate-200 border border-white/[0.1]",
      },
      size: {
        sm: "h-8 px-3 text-[11px]",
        md: "h-9 px-4 text-xs",
        lg: "h-10 px-5 text-sm",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
