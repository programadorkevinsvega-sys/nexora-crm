"use client"

import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "h-auto min-h-24 w-full rounded-inputs bg-graphite px-3 py-2 text-sm text-foreground placeholder:text-ash rekki-inset",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y leading-relaxed",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
