"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="date"
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-inputs)] bg-graphite px-3 py-2 text-body text-paper",
          "rekki-inset",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[color-scheme:dark]",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
