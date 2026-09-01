"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-8 w-full rounded-[6px] bg-[rgba(255,255,255,0.02)] border border-[#23252a] px-3 py-2 text-[13px] font-[400] text-[#d0d6e0] placeholder:text-[#62666d] transition-colors",
        "focus-visible:outline-none focus-visible:border-[#d0d6e0] focus-visible:bg-[rgba(255,255,255,0.03)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
