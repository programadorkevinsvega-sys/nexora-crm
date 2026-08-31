"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "h-9 w-full rounded-inputs bg-graphite px-3 text-sm text-foreground placeholder:text-ash rekki-inset",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
