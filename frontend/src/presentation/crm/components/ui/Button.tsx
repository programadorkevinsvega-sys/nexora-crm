"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/shared/utils/cn"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-[510] tracking-[-0.011em] transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary hover:opacity-90 text-primary-foreground rounded-[6px] shadow-xs",
        secondary:
          "bg-card hover:bg-muted text-foreground rounded-[6px] border border-border hover:border-border/80",
        ghost:
          "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-[6px]",
        danger:
          "bg-transparent hover:bg-destructive/10 text-destructive border border-border hover:border-destructive/30 rounded-[6px]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted rounded-[6px]",
        success:
          "bg-emerald-600 hover:bg-emerald-500 text-white rounded-[6px] shadow-xs",
        glass:
          "bg-muted/40 hover:bg-muted/70 text-foreground border border-border rounded-[6px]",
      },
      size: {
        sm: "h-7 px-3 text-[12px] [&_svg]:size-3",
        md: "h-8 px-4 text-[13px] [&_svg]:size-[14px]",
        lg: "h-9 px-5 text-[14px] [&_svg]:size-4",
        icon: "size-8 rounded-[6px] [&_svg]:size-[14px]",
      },
    },
    defaultVariants: {
      variant: "secondary",
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
