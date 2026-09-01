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
          "bg-[#e4f222] hover:bg-[#edf755] text-[#08090a] rounded-[6px] shadow-[rgba(0,0,0,0.01)_0px_5px_2px_0px,rgba(0,0,0,0.04)_0px_3px_2px_0px,rgba(0,0,0,0.07)_0px_1px_1px_0px,rgba(0,0,0,0.08)_0px_0px_1px_0px]",
        secondary:
          "bg-transparent hover:bg-[#23252a] text-[#d0d6e0] rounded-[6px] border border-[#23252a] hover:border-[#383b3f]",
        ghost:
          "bg-transparent text-[#8a8f98] hover:text-[#d0d6e0] hover:bg-[rgba(255,255,255,0.04)] rounded-[6px]",
        danger:
          "bg-transparent hover:bg-[rgba(235,87,87,0.08)] text-[#eb5757] border border-[#23252a] hover:border-[rgba(235,87,87,0.3)] rounded-[6px]",
        outline:
          "border border-[#23252a] bg-transparent text-[#d0d6e0] hover:bg-[rgba(255,255,255,0.03)] hover:border-[#383b3f] rounded-[6px]",
        success:
          "bg-[#27a644] hover:bg-[#2db84e] text-white rounded-[6px] shadow-[rgba(0,0,0,0.4)_0px_2px_4px_0px]",
        glass:
          "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-[#d0d6e0] border border-[#23252a] rounded-[6px]",
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
